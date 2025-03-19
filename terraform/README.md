# Class Harmony - Infrastructure as Code

This directory contains Terraform configurations for deploying Class Harmony to various cloud providers. The infrastructure is defined as code, allowing for consistent, repeatable deployments across different environments.

## Supported Cloud Providers

- [AWS](./aws) - Deploy to Amazon Web Services

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0 or newer)
- Cloud provider CLI tools and authentication set up (e.g., AWS CLI)
- SSH key pair for accessing EC2 instances

## Deployment Instructions

### AWS Deployment

1. Navigate to the AWS directory:
   ```bash
   cd aws
   ```

2. Create a `terraform.tfvars` file with your specific values:
   ```
   key_name         = "your-ssh-key-name"
   allowed_ssh_cidr = "your-ip-address/32"  # For security, restrict to your IP
   jwt_secret       = "your-secure-jwt-secret"
   email_username   = "your-email@example.com"
   email_password   = "your-email-password-or-app-password"
   ```

3. Initialize Terraform:
   ```bash
   terraform init
   ```

4. Review the execution plan:
   ```bash
   terraform plan
   ```

5. Apply the configuration:
   ```bash
   terraform apply
   ```

6. After successful deployment, you will see outputs including the public IP address of your application server.

## Using MongoDB Atlas (Optional)

For production deployments, consider using MongoDB Atlas instead of the self-hosted MongoDB:

1. Create a MongoDB Atlas cluster
2. Set the `mongodb_uri` variable in your `terraform.tfvars` file:
   ```
   mongodb_uri = "mongodb+srv://username:password@cluster.mongodb.net/class_harmony?retryWrites=true&w=majority"
   ```

## SSL/TLS Configuration (Optional)

For production deployments, you should configure SSL/TLS:

1. Set the `domain_name` and `create_dns_record` variables
2. Install Certbot on the EC2 instance for Let's Encrypt certificates
3. Configure Nginx to use SSL/TLS

## Cleanup

To destroy all resources created by Terraform:

```bash
terraform destroy
```

⚠️ **Warning**: This will permanently delete all resources. Make sure you have backups of important data. 