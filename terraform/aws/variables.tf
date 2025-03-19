variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., production, staging, development)"
  type        = string
  default     = "production"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Ubuntu 22.04 LTS)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS in us-east-1, update for other regions
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium" # 2 vCPU, 4 GiB RAM
}

variable "key_name" {
  description = "Name of the SSH key pair to use for EC2 instance"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH to the EC2 instance"
  type        = string
  default     = "0.0.0.0/0" # Consider restricting to your IP for security
}

variable "domain_name" {
  description = "Domain name for the application (if any)"
  type        = string
  default     = ""
}

variable "create_dns_record" {
  description = "Whether to create DNS record in Route 53"
  type        = bool
  default     = false
}

variable "mongodb_uri" {
  description = "MongoDB connection URI (leave empty to use the local MongoDB)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT authentication"
  type        = string
  sensitive   = true
}

variable "email_service" {
  description = "Email service provider (e.g., gmail, sendgrid)"
  type        = string
  default     = "gmail"
}

variable "email_username" {
  description = "Email username for sending notifications"
  type        = string
  sensitive   = true
}

variable "email_password" {
  description = "Email password or API key"
  type        = string
  sensitive   = true
}

variable "email_from" {
  description = "Email address notifications are sent from"
  type        = string
  default     = "noreply@classharmony.com"
} 