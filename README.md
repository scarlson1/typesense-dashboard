# Typesense Dashboard

A dashboard to manage self hosted or local [Typesense](https://typesense.org/) instances.

Reference the [Typesense docs](https://typesense.org/docs/guide/install-typesense.html) to set up a new cluster.

## Usage

#### Prerequisites

- running instance of typesense ([docs](https://typesense.org/docs/guide/install-typesense.html#option-1-typesense-cloud))

### Web

Use https://scarlson1.github.io/typesense-dashboard/ or clone the repository and run it locally. (If using github pages option, Typesense config must be configured with SSL or you'll get "ERR_NETWORK Network Error").

- [Typesense Docs](https://typesense.org/docs/29.0/api/server-configuration.html#ssl-https)
- Self-signed certificate references: [video](https://www.youtube.com/watch?v=sR4_YISXNZE) / [article](https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/) / [mkcert](https://github.com/FiloSottile/mkcert)

If your typesense instance is running locally, use a service such as [ngrok](https://ngrok.com/) or [tailscale](https://tailscale.com/) to add SSL if connecting to [github pages](https://scarlson1.github.io/typesense-dashboard/). For example:

```bash
$ ngrok http https://localhost:443
  # OR use ngrok's docker image:
$ docker run -it -e NGROK_AUTHTOKEN=[YOUR_NGROK_TOKEN] ngrok/ngrok:latest http host.docker.internal:443
```

Then use the address displayed in your console under "Forwarding" as the node when connecting your cluster (ex: f4ab4aad2e7b.ngrok-free.app). [Ngrok docs](https://ngrok.com/docs/using-ngrok-with/docker/)

If using the Github pages option, pass the `--enable-cors` flag in typesense command.

Use an admin key to authenticate. Cluster credentials are stored in session storage and will be removed when the window is closed.

### Docker

Download the repo and run in Docker Desktop:

```bash
$ git clone git@github.com:scarlson1/typesense-dashboard.git
$ docker build -t typesense-dashboard .
$ docker run -d -p 8108:8108 typesense-dashboard
```

From Docker Desktop:

```bash
$ docker pull spencercarlson/typesense-dashboard
$ docker run -d -p 8108:8108 spencercarlson/typesense-dashboard
```

From Github Registry:

```bash
$ docker run -d -p 443:443 docker pull ghcr.io/scarlson1/typesense-dashboard:latest
```

To enable geosearch, pass a mapbox key as an environment variable (i.e. docker run [...] -e VITE_MAPBOX_TOKEN="your_mapbox_token")

<!-- To use the latest pre-built image:

```bash
docker pull spencercarlson/typesense-dashboard
# or
docker run -d -p 443:443 spencercarlson/typesense-dashboard
```

To use the latest pre-built docker image:
```bash
docker run -d -p 443:443 ghcr.io/scarlson1/typesense-dashboard:latest
```

```bash
docker run -d -p 80:80 ghcr.io/scarlson1/typesense-dashboard:latest
```

If you have trouble connecting, trying ngrok.
option 1) ngrok http https://localhost:443
option 2) https://ngrok.com/docs/using-ngrok-with/docker/
-->

<!-- ## Limitations/Issues

TODO -->

## TODO

- Tests
- [Filter operators](https://typesense.org/docs/guide/tips-for-filtering.html#available-operators)
- [Boolean operators](https://typesense.org/docs/guide/tips-for-filtering.html#boolean-operations)
- [Geo operators](https://typesense.org/docs/guide/tips-for-filtering.html#filtering-geopoints)
- [Geosearch filter & sort](https://typesense.org/docs/29.0/api/geosearch.html#searching-within-a-radius)
- Delete documents by query
- Export documents
- Set up demo typesense instance with data

## Screenshots

![API keys](docs/images/api_keys.png)

![search](docs/images/search.png)

![geo search](docs/images/geosearch.png)

![search parameters](docs/images/search_params.png)

![server status](docs/images/server_status.png)

![collections](docs/images/collections.png)

![edit collection schema](docs/images/edit_collection.png)

![add documents](docs/images/add_documents.png)

![alias](docs/images/alias.png)

![presets](docs/images/presets.png)

![synonyms](docs/images/synonyms.png)

![analytics rules](docs/images/analytics_rules.png)

# Alternatives

- [Typesense Cloud](https://cloud.typesense.org/) (paid)
- bfritscher/typesense-dashboard [github](https://github.com/bfritscher/typesense-dashboard/tree/main) (vue)
- amartya-dev/typesense-dashboard [github](https://github.com/amartya-dev/typesense-dashboard) (typescript)

# Development

### Run locally

#### Install dependencies

```bash
npm install
```

#### Start the dashboard

```bash
npm run dev
```

### Docker Compose

Update the volume paths in `compose.yml` or update `TYPESENSE_CERTS_DIR` and `TYPESENSE_DATA_PATH` environment variable in `.env.development`

```yml
volumes:
  - [path_to_typesense_data]:/data
  - [path_to_your_certs_directory]:/etc/ssl/certs
```

```bash
docker compose up -d
```

## VM to host demo Typesense instance

### 1. Create the VM

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

`cloud-init.yaml` will install typesense and start it as a systemd service

### 2. SSH into VM & run scripts

[Airbnb data source](https://insideairbnb.com/get-the-data/)

```bash
ssh [username]@[hostname_or_IP_address]

# download csv data for region or city
npx ts-node scripts/downloadData.ts --cities "nashville" --file-types "listings.csv.gz" # --dry-run
# npx ts-node scripts/downloadData.ts --dry-run --regions "united-states" --file-types "listings.csv.gz"

# transform data
npx ts-node scripts/transformData.ts

# import into typesense
export TYPESENSE_HOST=<TYPESENSE_HOST>
export TYPESENSE_PORT=443
export TYPESENSE_PROTOCOL=https
export TYPESENSE_ADMIN_API_KEY=xyz
npx ts-node scripts/indexData.ts
```

## Set up demo data

Find a dataset. Checkout [Typesense's example datasets](https://github.com/typesense/typesense?tab=readme-ov-file)

Demo uses [Airbnb data](https://insideairbnb.com/get-the-data/)

```bash
# download data
# regions
npx ts-node downloadData.ts --list-regions
npx ts-node scripts/downloadData.ts --dry-run --regions "united-states" --file-types "listings.csv.gz"
npx ts-node scripts/downloadData.ts --regions "united-states" --file-types "listings.csv.gz"
# cities
npx ts-node downloadData.ts --cities "amsterdam,london,new-york-city" --file-types "listings.csv.gz"

# transform data
npx ts-node scripts/transformData.ts

# index/import into typesense
export TYPESENSE_HOST=<typesense-host>
export TYPESENSE_PORT=443
export TYPESENSE_PROTOCOL=https
export TYPESENSE_ADMIN_API_KEY=xyz123
npx ts-node scripts/indexData.ts
```

## Setup HTTPS with nip.io + Let's Encrypt

VM Typesense instance requires TSL to connect to Github Pages dashboard.

### 1. Get Your Reserved IP

You already have this from Terraform output:

```bash
terraform output public_ip
```

Your nip.io domain is automatically `<your-ip>.nip.io` — no signup, no config. If your IP is `1.2.3.4` your domain is `1.2.3.4.nip.io`.

---

### 2. Open Port 80 in OCI Security List

Certbot needs port 80 to verify domain ownership. Add this to `main.tf`:

```hcl
ingress_security_rules {
  protocol = "6"
  source   = "0.0.0.0/0"
  tcp_options {
    min = 80
    max = 80
  }
}
```

Also open port 80 on the VM's iptables:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

The chicken-and-egg problem: the reserved IP is needed before it can be added to terraform.tfvars, but the IP is created by Terraform. If the reserved IP hasn't been created, the solution is to create the reserved IP first in a separate apply:

```bash
# Step 1 - create reserved IP and instance, no attachment
terraform apply -var="attach_reserved_ip=false"

# Get the IP and update terraform.tfvars
terraform output reserved_ip
# set public_ip = "<output>" in terraform.tfvars

# Step 2 - attach reserved IP to instance
terraform apply -var="attach_reserved_ip=true"
```

Then `terraform apply` (if not already run in ip step)

---

### 3. Install Certbot on the VM

```bash
ssh ubuntu@<your-ip>
sudo apt-get update
sudo apt-get install -y certbot
```

---

### 4. Stop Typesense Temporarily

Certbot needs port 80 free to run its standalone verifier:

```bash
sudo systemctl stop typesense
```

---

### 5. Issue the Certificate

```bash
sudo certbot certonly --standalone -d <your-ip>.nip.io
```

Follow the prompts — enter an email for renewal notices. Certbot will place certs at:

- `/etc/letsencrypt/live/<your-ip>.nip.io/fullchain.pem`
- `/etc/letsencrypt/live/<your-ip>.nip.io/privkey.pem`

---

### 6. Configure Typesense to Use the Cert

```bash
sudo tee /etc/typesense/typesense-server.ini <<EOF
[server]
api-key = your-typesense-api-key
data-dir = /var/lib/typesense
log-dir = /var/log/typesense
api-port = 443
enable-cors = true
ssl-certificate = /etc/letsencrypt/live/<your-ip>.nip.io/fullchain.pem
ssl-certificate-key = /etc/letsencrypt/live/<your-ip>.nip.io/privkey.pem
EOF
```

Give Typesense access to the certs:

```bash
sudo chown -R typesense:typesense /etc/letsencrypt/live/<your-ip>.nip.io/
sudo chown -R typesense:typesense /etc/letsencrypt/archive/<your-ip>.nip.io/
```

---

### 7. Restart Typesense

```bash
sudo systemctl start typesense
sudo systemctl status typesense
```

Verify:

```bash
curl https://<your-ip>.nip.io/health
# {"ok":true}
```

---

### 8. Set Up Auto-Renewal

Let's Encrypt certs expire every 90 days. Automate renewal with a cron job:

```bash
sudo crontab -e
```

Add:

```cron
0 3 * * * certbot renew --quiet --pre-hook "systemctl stop typesense" --post-hook "systemctl start typesense"
```

This runs at 3am daily, only renews when within 30 days of expiry, and handles stopping/starting Typesense around the renewal.

---

### 9. Update Your Dashboard

Connect using:

- **Host:** `<your-ip>.nip.io`
- **Port:** `443`
- **Protocol:** `https`
- **API Key:** your Typesense API key

---

### 10. Update cloud-init for Future Deploys

Add this to your `cloud-init.yaml` so it's fully automated if you ever recreate the VM:

```yaml
runcmd:
  # ... existing commands ...

  # Install certbot and issue cert
  - apt-get install -y certbot
  - systemctl stop typesense
  - certbot certonly --standalone --non-interactive --agree-tos --email your@email.com -d ${public_ip}.nip.io
  - chown -R typesense:typesense /etc/letsencrypt/live/${public_ip}.nip.io/
  - chown -R typesense:typesense /etc/letsencrypt/archive/${public_ip}.nip.io/
  - systemctl start typesense

  # Auto-renewal cron
  - echo "0 3 * * * certbot renew --quiet --pre-hook 'systemctl stop typesense' --post-hook 'systemctl start typesense'" | crontab -
```

Note that `${public_ip}` would need to be passed as a template variable in `cloud-init.yaml` just like `typesense_api_key`.
