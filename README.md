# Typesense Dashboard

A dashboard to manage self hosted or local [Typesense](https://typesense.org/) instances.

Reference the [Typesense docs](https://typesense.org/docs/guide/install-typesense.html) to set up a new cluster.

[View with demo data](https://scarlson1.github.io/typesense-dashboard/#/auth?node=163.192.220.255.nip.io&port=443&protocol=https&apiKey=q0DAf2GWCdw0LPCzM72UytDVh719h4Tk&env=development)

If the link is not prefilling login creds, use the following:

- dashboard: [https://scarlson1.github.io/typesense-dashboard](https://scarlson1.github.io/typesense-dashboard/#/auth)
- host: 163.192.220.255.nip.io
- protocol: https
- port: 443
- api key: q0DAf2GWCdw0LPCzM72UytDVh719h4Tk

## Supported Versions

Intended to be compatible with `v29` and `v30`.

## Usage

#### Prerequisites

- running instance of typesense ([docs](https://typesense.org/docs/guide/install-typesense.html#option-1-typesense-cloud))

### Web

Use https://scarlson1.github.io/typesense-dashboard/ or clone the repository and run it locally. (If using github pages option, Typesense config must be configured with TLS or you'll get "ERR_NETWORK Network Error").

- [Typesense Docs](https://typesense.org/docs/29.0/api/server-configuration.html#ssl-https)
- Self-signed certificate references: [video](https://www.youtube.com/watch?v=sR4_YISXNZE) / [article](https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/) / [mkcert](https://github.com/FiloSottile/mkcert)

If your typesense instance is running locally, use a service such as [ngrok](https://ngrok.com/) or [tailscale](https://tailscale.com/) to add TLS if connecting to [github pages](https://scarlson1.github.io/typesense-dashboard/). For example:

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
- Fix multi-cluster auth (currently overwriting existing)
- save collection preset preferences in local storage

## Screenshots

![API keys](docs/images/api_keys.png)

![search](docs/images/search.png)

![geo search](docs/images/geosearch-dark.png)

<!-- ![geo search](docs/images/geosearch.png) -->

![search parameters](docs/images/search_params.png)

![server status](docs/images/server_status.png)

![collections](docs/images/collections.png)

![edit collection schema](docs/images/edit_collection.png)

![add documents](docs/images/add_documents.png)

![alias](docs/images/alias.png)

![presets](docs/images/presets.png)

![synonyms](docs/images/synonyms.png)

![analytics rules](docs/images/analytics_rules.png)

![search refinements](docs/images/search-dark.png)

# Alternatives

- [Typesense Cloud](https://cloud.typesense.org/) (paid)
- bfritscher/typesense-dashboard [github](https://github.com/bfritscher/typesense-dashboard/tree/main) (vue)
- amartya-dev/typesense-dashboard [github](https://github.com/amartya-dev/typesense-dashboard) (typescript)

# Development

## Run locally

#### Install dependencies

```bash
pnpm install
```

#### Start the dashboard

```bash
pnpm dev
```

## Docker Compose

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
# Step 1 - create reserved IP and instance, no attachment
terraform apply -var="attach_reserved_ip=false"

# Get the IP and update terraform.tfvars
terraform output reserved_ip
# set public_ip = "<output>" in terraform.tfvars

# Step 2 - attach reserved IP to instance
terraform apply -var="attach_reserved_ip=true"
```

`cloud-init.yaml`:

- installs typesense and start it as a systemd service
- configures iptables
- configures certificates and cron for auto-renewal

### Connect to typesense

nip.io is used for TLS. The address to access the VM is: `https://<your-ip>.nip.io`

Connect using:

- **Host:** `<your-ip>.nip.io`
- **Port:** `443`
- **Protocol:** `https`
- **API Key:** your Typesense API key (from `terraform.tfvars`)

## Set up demo data

Find a dataset. Checkout [Typesense's example datasets](https://github.com/typesense/typesense?tab=readme-ov-file)

Demo uses [Airbnb data](https://insideairbnb.com/get-the-data/)

> Import script creates an alias and points `airbnb_listings` to the newly imported data upon completion (effectively overwrites; doesn't append)

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

### Troubleshooting

```bash
sudo systemctl status typesense-server

sudo iptables -L INPUT -n | head -20
sudo ss -tlnp | grep typesense

sudo cat /etc/typesense/typesense-server.ini
sudo systemctl cat typesense-server

# typesense install runs as root --> create typesense user
sudo systemctl restart typesense-server
sudo journalctl -u typesense-server -f &
sleep 3
sudo ss -tlnp | grep typesense-serve

# force recreate
terraform taint oci_core_instance.typesense
terraform apply -var="attach_reserved_ip=true"

# reset ssh
ssh-keygen -R 163.192.220.255
```

### TODOs

- theme matching toasts
- handle [analytics rule changes](https://typesense.org/docs/30.2/api/analytics-query-suggestions.html#enabling-the-feature) in v30
  - the transition from v29 to v30 introduced important architectural changes to query analytics, curation, and synonyms. While v29 combined various rule definitions, v30 separates them into explicit, distinct APIs (such as analytics and curation sets)
  - When you upgrade a cluster, existing v29 analytics rules remain backward compatible and will continue functioning.
  - still need to handle displaying different forms ??
  - analytics route remains the same
  - curation: /collections/:collection_name/overrides -> /curation_sets. Depends on the sdk version I'm using?
    - For v29 Engines: You must use the collection-nested endpoints via .collections('name').overrides().
    - For v30 Engines: You must use the new top-level .curationSets() and .analytics.rules() methods
    - analytics:
      - For v29 Rules: The SDK expects you to wrap your parameters inside the .params sub-object property.
      - For v30 Rules: The SDK expects a completely flattened object property layout, as .params has been deprecated and removed from the rule creation schema

Analytics:

```json
// v29
{
  "name": "popular-searches-rule",
  "type": "popular_queries",
  "params": {
    "source_collections": ["products"],
    "destination_collection": "popular_queries_collection",
    "limit": 1000
  }
}
```

```json
// v30
{
  "name": "popular-searches-rule",
  "type": "popular_queries",
  "source_collections": ["products"],
  "destination_collection": "popular_queries_collection",
  "limit": 1000
}
```

Curation Rules (Overrides):

```json
// v29
// POST /collections/products/overrides
{
  "id": "promote-apple",
  "rule": {
    "query": "apple",
    "match": "exact"
  },
  "includes": [
    { "id": "422", "position": 1 },
    { "id": "54", "position": 2 }
  ],
  "excludes": [{ "id": "287" }]
}
```

```json
// v30
// POST /curation_sets
{
  "id": "global-apple-curation",
  "rules": [
    {
      "id": "rule-1",
      "conditions": [
        {
          "query": "apple",
          "match": "exact"
        }
      ],
      "actions": {
        "includes": [
          { "id": "422", "position": 1 },
          { "id": "54", "position": 2 }
        ],
        "excludes": [{ "id": "287" }]
      }
    }
  ]
}
```

```typescript
// Example: Creating a Curation / Override Rule based on cluster version
async function submitCurationForm(
  client: any,
  version: 'v29' | 'v30',
  collectionName: string,
  payload: any,
) {
  if (version === 'v30') {
    // Uses the new top-level v30 Curation Sets API
    return await client.curationSets().create(payload.v30Data);
  } else {
    // Uses the legacy nested v29 Overrides API
    return await client
      .collections(collectionName)
      .overrides()
      .upsert(payload.v29Id, payload.v29Data);
  }
}
```

```typescript
import { Client } from 'typesense';

// 1. Define a unified form state structure (modeled after v30 style)
interface UnifiedCurationFormState {
  ruleId: string;
  query: string;
  matchType: 'exact' | 'contains';
  pinnedDocumentIds: string[]; // Maps to positions sequentially
  excludedDocumentIds: string[];
}

/**
 * Submits curation data to Typesense by automatically morphing
 * the payload shape and routing to the correct API methods.
 */
async function saveCurationRule(
  typesenseClient: Client,
  version: 'v29' | 'v30',
  collectionName: string, // Required only for v29 fallback
  formData: UnifiedCurationFormState,
) {
  if (version === 'v30') {
    // Transform unified data into the top-level Curation Sets schema
    const v30Payload = {
      id: formData.ruleId,
      rules: [
        {
          id: `${formData.ruleId}-rule`,
          conditions: [
            {
              query: formData.query,
              match: formData.matchType,
            },
          ],
          actions: {
            includes: formData.pinnedDocumentIds.map((id, index) => ({
              id,
              position: index + 1,
            })),
            excludes: formData.excludedDocumentIds,
          },
        },
      ],
    };

    // Route to the new v30 top-level collection endpoint
    // Note: Depends on typesense-js client matching v30 structures
    return await (typesenseClient as any)
      .curationSets()
      .upsert(formData.ruleId, v30Payload);
  } else {
    // Transform unified data into the legacy nested Overrides schema
    const v29Payload = {
      id: formData.ruleId,
      rule: {
        query: formData.query,
        match: formData.matchType,
      },
      includes: formData.pinnedDocumentIds.map((id, index) => ({
        id,
        position: index + 1,
      })),
      excludes: formData.excludedDocumentIds.map((id) => ({ id })),
    };

    // Route to the collection-nested overrides endpoint required by v29
    return await typesenseClient
      .collections(collectionName)
      .overrides()
      .upsert(formData.ruleId, v29Payload);
  }
}
```

other breaking api changes from v29 to v30:

### The Global Synonyms API Redesign

Similar to overrides, synonyms have been decoupled from individual collections and moved into a global standalone resource.

- The v29 Way: You managed synonyms on a per-collection basis at POST /collections/:collection_name/synonyms.
- The v30 Way: You must use the new top-level synonym_sets API at POST /synonym_sets.
- Impact on Your Forms: If you have an admin UI form for managing search synonyms, you must update its schema and action endpoint. While data migrates automatically on the cluster backend, the v29 sub-resource endpoint will return an error when targeted via v30 client libraries

### API Key Scoping & Permission Rules

Because Curation Rules and Synonym Sets are no longer nested parameters inside a collection, your Typesense API Keys require explicit new permission scopes.

- v29 Keys: An API key with access to overrides:_ or synonyms:_ scoped to a collection would allow managing those settings.
- v30 Keys: These legacy scopes will throw 401 Unauthorized errors on the new global endpoints. You must regenerate or update administrative API keys to grant explicit, top-level permissions for curation*sets:* and synonym*sets:*

### Union Search Pagination Behavior

Typesense v30 officially introduces Union Search (allowing multi-collection or multi-query combinations in a single round-trip).

- Behavioral Change: When combining multiple queries using union search, individual pagination parameters (per_page, page) trigger strict system warnings or behavior adjustments if you attempt to paginate the underlying subsets independently rather than treating the merged union response as a single global dataset

### Search Filter Syntax Additions

While not strictly breaking to old queries, v30 introduces streamlined syntax variations that change how filters are parsed.

- Standalone Negation: Typesense v30 adds support for using ! as a standalone negation operator inside filter_by blocks. For example, the query syntax field:![value] is now natively supported as a shorter, direct alternative to field:!=[value]

v29 Synonym Structure

```json
{
  "id": "footwear-synonyms",
  "synonyms": ["sneaker", "shoe", "boot"],
  "root": "shoe"
}
```

Use code with caution.Note: If root is omitted, it defaults to a multi-way synonym. If root is defined, it behaves as a one-way synonym.

v30 Synonym Structure

```json
{
  "id": "footwear-synonyms",
  "synonyms": ["sneaker", "shoe", "boot"],
  "root": "shoe"
}
```

Use code with caution.The payload fields look similar at a glance, but how they link to collections changed. In v29, the payload is explicitly submitted into a specific collection URL. In v30, you submit to a global endpoint and attach it to collections dynamically during search, or by defining links.

### API keys

Because curation (overrides) and synonyms are no longer nested sub-resources inside a collection, v29 permission actions will break with 401 Unauthorized errors in v30.You must recreate administrative and management keys to handle the updated scopes.Rule Matrix Changes

Capability | v29 Permitted Action Value | v30 Permitted Action Value
All Overrides / Curation | overrides:_ | curation_sets:_
Read Overrides | overrides:get, overrides:list | curation*sets:get, curation_sets:list
All Synonyms Operations | synonyms:* | synonym*sets:*
Write/Create Synonyms | synonyms:create | synonym_sets:create

API Key Payload ComparisonOld v29 Multi-Tenant Key DefinitionIn v29, restricting an API key to a specific collection automatically isolated its overrides and synonyms because they were nested inside that namespace.

```json
{
  "description": "v29 limited management key",
  "actions": ["overrides:*", "synonyms:*", "documents:*"],
  "collections": ["tenant_a_products"]
}
```

Use code with caution.New v30 Global Scope DefinitionIn v30, because curation sets and synonym sets are top-level global resources, scoping the key to a collection name is no longer enough to limit rule access. You must grant top-level resource permissions explicitly:

```json
{
  "description": "v30 modern management key",
  "actions": ["curation_sets:*", "synonym_sets:*", "documents:*"],
  "collections": ["tenant_a_products"]
}
```
