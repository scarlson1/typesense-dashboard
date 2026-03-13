resource "oci_core_public_ip" "typesense_reserved" {
  compartment_id = oci_identity_compartment.typesense.id
  lifetime       = "RESERVED"
  display_name   = "typesense-reserved-ip"

  private_ip_id = var.attach_reserved_ip ? data.oci_core_private_ips.typesense_private_ip[0].private_ips[0].id : null


  lifecycle {
    prevent_destroy = true
  }
}

output "reserved_ip" {
  value = oci_core_public_ip.typesense_reserved.ip_address
}