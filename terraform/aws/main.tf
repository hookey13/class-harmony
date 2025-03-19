provider "aws" {
  region = var.aws_region
}

# VPC for the application
resource "aws_vpc" "class_harmony_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "class-harmony-vpc"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Public subnet for the application
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.class_harmony_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "class-harmony-public-subnet"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Private subnet for the database
resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.class_harmony_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name        = "class-harmony-private-subnet"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.class_harmony_vpc.id

  tags = {
    Name        = "class-harmony-igw"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Route table for public subnet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.class_harmony_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name        = "class-harmony-public-rt"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Route table association with public subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Security group for the application server
resource "aws_security_group" "app_sg" {
  name        = "class-harmony-app-sg"
  description = "Allow traffic for Class Harmony application"
  vpc_id      = aws_vpc.class_harmony_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "class-harmony-app-sg"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Security group for the database
resource "aws_security_group" "db_sg" {
  name        = "class-harmony-db-sg"
  description = "Allow traffic from application to database"
  vpc_id      = aws_vpc.class_harmony_vpc.id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "class-harmony-db-sg"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# EC2 instance for the application
resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              mkdir -p /opt/class-harmony
              cd /opt/class-harmony
              git clone https://github.com/yourusername/class-harmony.git .
              cp .env.example .env
              # Configure environment variables here
              docker-compose up -d
              EOF

  tags = {
    Name        = "class-harmony-app-server"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Elastic IP for the application server
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name        = "class-harmony-app-eip"
    Environment = var.environment
    Project     = "ClassHarmony"
  }
}

# Output the application server's public IP
output "app_server_public_ip" {
  value = aws_eip.app_eip.public_ip
} 