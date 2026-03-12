# output "reserved_ip" {
#   value = oci_core_public_ip.typesense_reserved.ip_address
# }

output "typesense_url" {
  value = "https://${oci_core_public_ip.typesense_reserved.ip_address}.nip.io"
}

# output "public_ip" {
#   value = oci_core_public_ip.typesense_ip_assignment.ip_address
# }

# output "typesense_url" {
#   value = "http://${oci_core_public_ip.typesense_ip_assignment.ip_address}:443"
# }