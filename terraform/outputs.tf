output "public_ip" {
  value = oci_core_instance.typesense.public_ip
}

output "typesense_url" {
  value = "https://${oci_core_instance.typesense.public_ip}"
}