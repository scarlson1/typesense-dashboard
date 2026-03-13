terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Create a dedicated compartment for Typesense
resource "oci_identity_compartment" "typesense" {
  compartment_id = var.tenancy_ocid
  name           = "typesense"
  description    = "Typesense server resources"
}

# ── VCN ─────────────────────────────────────────────────────────────────────

resource "oci_core_vcn" "typesense_vcn" {
  compartment_id = oci_identity_compartment.typesense.id
  cidr_block     = "10.0.0.0/16"
  display_name   = "typesense-vcn"
  dns_label      = "typesensevcn"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = oci_identity_compartment.typesense.id
  vcn_id         = oci_core_vcn.typesense_vcn.id
  display_name   = "typesense-igw"
  enabled        = true
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = oci_identity_compartment.typesense.id
  vcn_id         = oci_core_vcn.typesense_vcn.id
  display_name   = "typesense-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

# ── Security List ────────────────────────────────────────────────────────────

resource "oci_core_security_list" "typesense_sl" {
  compartment_id = oci_identity_compartment.typesense.id
  vcn_id         = oci_core_vcn.typesense_vcn.id
  display_name   = "typesense-security-list"

  # Allow all outbound
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # SSH - your IPv4
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "45.31.199.219/32"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Typesense HTTPS (443) - your IPv4
  ingress_security_rules {
    protocol = "6"
    source   = "45.31.199.219/32"
    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "140.82.112.0/20"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Typesense HTTPS - open to all (browser clients from GitHub Pages dashboard)
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # nip for TLS 
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
        min = 80
        max = 80
    }
  }
}

# ── Subnet ───────────────────────────────────────────────────────────────────

resource "oci_core_subnet" "public_subnet" {
  compartment_id    = oci_identity_compartment.typesense.id
  vcn_id            = oci_core_vcn.typesense_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "typesense-public-subnet"
  dns_label         = "public"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.typesense_sl.id]
}

# ── Compute Instance ─────────────────────────────────────────────────────────

resource "oci_core_instance" "typesense" {
  compartment_id      = oci_identity_compartment.typesense.id
  availability_domain = var.availability_domain
  display_name        = "typesense-server"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 6
  }

  source_details {
    source_type             = "image"
    source_id               = var.image_ocid
    boot_volume_size_in_gbs = 50
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = false
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(templatefile("${path.module}/cloud-init.yaml", {
      typesense_api_key = var.typesense_api_key
      public_ip         = var.public_ip
    }))
  }
}

# Look up the VNIC after instance creation
data "oci_core_vnic_attachments" "typesense_vnic" {
  count          = var.attach_reserved_ip ? 1 : 0
  compartment_id = oci_identity_compartment.typesense.id
  instance_id    = oci_core_instance.typesense.id
}

data "oci_core_private_ips" "typesense_private_ip" {
  count   = var.attach_reserved_ip ? 1 : 0
  vnic_id = data.oci_core_vnic_attachments.typesense_vnic[0].vnic_attachments[0].vnic_id
}
