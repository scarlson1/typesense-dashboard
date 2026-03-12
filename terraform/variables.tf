variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}
variable "region" {}
# variable "compartment_ocid" {}
variable "availability_domain" {}
variable "image_ocid" {}
variable "ssh_public_key" {}
variable "typesense_api_key" {}

variable "public_ip" {}
variable "attach_reserved_ip" {
  type    = bool
  default = false
}



