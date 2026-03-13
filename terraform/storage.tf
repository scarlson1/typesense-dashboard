resource "oci_core_volume" "typesense_data" {
  compartment_id      = oci_identity_compartment.typesense.id
  availability_domain = var.availability_domain
  display_name        = "typesense-data"
  size_in_gbs         = 10

  lifecycle {
    prevent_destroy = true
  }
}

resource "oci_core_volume_attachment" "typesense_data_attachment" {
  attachment_type = "paravirtualized"
  instance_id     = oci_core_instance.typesense.id
  volume_id       = oci_core_volume.typesense_data.id
  display_name    = "typesense-data-attachment"
}