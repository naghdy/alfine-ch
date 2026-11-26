# Deployment, domain and email

How to publish alfine.ch on GitHub Pages with the domain registered at Namecheap, and set up the `info@alfine.ch` mailbox. Values were checked against the official documentation in November 2026; the sources are linked at the end of each section.

Order of work:

1. Merge the pull request into `main` (GitHub Pages and Actions).
2. Verify the domain on your GitHub account.
3. Add the DNS records at Namecheap.
4. Set the custom domain in the repository and enforce HTTPS.
5. Set up the mailbox and its DNS records.
6. Run the [post-launch checklist](POST-LAUNCH.md).

---

## 1. GitHub Pages and Actions

1. Repository **Settings > Pages > Build and deployment > Source**: choose **GitHub Actions**.
2. **Settings > Secrets and variables > Actions > Variables**: add `FORMSPREE_FORM_ID` (see the README).
3. Merge the pull request. The **Build and deploy** workflow builds the site and publishes it. Its run page shows the published URL.

The workflow needs `pages: write` and `id-token: write`, which it requests itself. With an Actions workflow the `CNAME` file in the build is ignored, so the custom domain must be set in Settings (step 4). The file is kept in the repo as a record of the intended domain.

Sources: [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Troubleshooting custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

## 2. Verify the domain on GitHub (recommended)

Verification stops anyone else from pointing a GitHub Pages site at your domain.

1. Your GitHub **profile Settings > Pages > Add a domain**, enter `alfine.ch`.
2. GitHub shows a TXT record. At Namecheap add it as **TXT Record**, host `_github-pages-challenge-naghdy`, with the value GitHub gives you.
3. Back in GitHub, click **Verify**. DNS can take a while to propagate.

Source: [Verifying your custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

## 3. Namecheap Advanced DNS: website records

Namecheap: **Domain List > Manage (alfine.ch) > Advanced DNS > Host Records**.

First **delete the default parking records**: a **URL Redirect Record** on `@` and a **CNAME Record** on `www` pointing to a parking page. Namecheap says these should always be removed when connecting a domain. Leave the **Nameservers** on *Namecheap BasicDNS*.

Then click **Add New Record** for each row and finish with **Save All Changes** (the green tick on each row):

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `185.199.108.153` | Automatic |
| A Record | `@` | `185.199.109.153` | Automatic |
| A Record | `@` | `185.199.110.153` | Automatic |
| A Record | `@` | `185.199.111.153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8000::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8001::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8002::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8003::153` | Automatic |
| CNAME Record | `www` | `naghdy.github.io.` | Automatic |

Notes:

- The `www` CNAME points to `naghdy.github.io` only, without the repository name.
- Because the custom domain is the apex (`alfine.ch`), GitHub automatically redirects `www.alfine.ch` to `alfine.ch` once both records exist.
- Do not add any other A, AAAA or ALIAS record on `@`; extra records can stop GitHub from issuing the HTTPS certificate.
- If you ever add a CAA record, it must allow `letsencrypt.org`.
- Namecheap's own GitHub Pages article lists only the A records. GitHub's documentation also lists the AAAA records for IPv6; adding both is recommended.

Check from a terminal once saved (can take up to an hour or two):

```sh
dig alfine.ch A +short          # the four 185.199.x.153 addresses
dig alfine.ch AAAA +short       # the four 2606:50c0:800x::153 addresses
dig www.alfine.ch CNAME +short  # naghdy.github.io.
```

Sources: [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Securing your site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), [Namecheap: host records](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/), [Namecheap: parking records](https://www.namecheap.com/support/knowledgebase/article.aspx/9837/46/how-to-connect-a-domain-to-a-server-or-hosting/), [Namecheap: GitHub Pages](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)

## 4. Custom domain and HTTPS in the repository

1. Repository **Settings > Pages > Custom domain**: enter `alfine.ch` and click **Save**. GitHub runs a DNS check.
2. When the check passes, tick **Enforce HTTPS**. The certificate comes from Let's Encrypt and the option can take up to 24 hours to become available after DNS is correct.

Source: [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 5. Mailbox for info@alfine.ch

### Recommendation: Namecheap Private Email

The simplest option, because the domain and DNS are already at Namecheap: buying a Private Email plan for `alfine.ch` and choosing it in **Advanced DNS > Mail Settings** adds the mail records for you. One mailbox (`info@`) is enough; add aliases later if needed.

Alternative if you prefer data hosted in Switzerland: **Infomaniak Mail** (Geneva). It needs the records entered by hand (MX `mta-gw.infomaniak.ch` priority 5, SPF `include:spf.infomaniak.ch`, DKIM value from the Infomaniak Manager). Google Workspace also works but is more than one mailbox needs.

### Private Email setup

1. Buy a Private Email plan for `alfine.ch` in Namecheap and create the mailbox `info@alfine.ch`.
2. **Advanced DNS > Mail Settings**: choose **Private Email** and save. Namecheap adds the MX and SPF records automatically.
3. **Private Email > Manage > DKIM > Generate**. On BasicDNS the DKIM TXT record is added automatically.
4. Add the DMARC record by hand (table below).
5. Compare what Advanced DNS now shows with the table and add anything missing.

### Records (ready to copy)

| Purpose | Type | Host | Value | Priority |
|---|---|---|---|---|
| Mail delivery | MX | `@` | `mx1.privateemail.com` | 10 |
| Mail delivery | MX | `@` | `mx2.privateemail.com` | 10 |
| SPF | TXT | `@` | `v=spf1 include:spf.privateemail.com ~all` | |
| DKIM | TXT | `privateemail._domainkey` | value generated under Private Email > DKIM | |
| DMARC | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@alfine.ch` | |
| Optional: mail client setup | CNAME | `autodiscover` | `privateemail.com` | |
| Optional: mail client setup | CNAME | `autoconfig` | `privateemail.com` | |

- The DKIM host is `privateemail._domainkey` for plans bought from 2 June 2026; older subscriptions use `default._domainkey`. Use whatever the DKIM page shows.
- Start DMARC at `p=none` to collect reports. After two to four weeks of clean reports, tighten it to `p=quarantine`, and later `p=reject` if you wish.
- **No conflict with the website records:** mail uses MX and TXT records on `@`, while the website uses A and AAAA on `@` and a CNAME on `www`. Different record types on `@` coexist. Never add a CNAME on `@` (it would break both).
- Keep only one SPF record. If you later send email as `@alfine.ch` from another service, add its `include:` to that same record.
- DMARC reports go to `info@alfine.ch` in this example; use a separate address or alias if you prefer to keep them out of the main inbox.

Verify:

```sh
dig alfine.ch MX +short                         # 10 mx1.privateemail.com. / 10 mx2.privateemail.com.
dig alfine.ch TXT +short                        # contains "v=spf1 include:spf.privateemail.com ~all"
dig privateemail._domainkey.alfine.ch TXT +short  # long "v=DKIM1; k=rsa; p=..." value
dig _dmarc.alfine.ch TXT +short                 # "v=DMARC1; p=none; ..."
```

Then send a test message from `info@alfine.ch` to a Gmail address, open it, choose **Show original** and confirm **SPF: PASS**, **DKIM: PASS** and **DMARC: PASS**. A tool such as mail-tester.com gives a deliverability score.

Sources: [Private Email records](https://www.namecheap.com/support/knowledgebase/article.aspx/1340/2176/namecheap-private-email-records-for-domains-with-thirdparty-dns/), [Private Email on BasicDNS](https://www.namecheap.com/support/knowledgebase/article.aspx/1338/2176/how-to-set-up-namecheap-private-email-dns-records-for-domains-on-namecheap-basicpremium-nameservers/), [DKIM for Private Email](https://www.namecheap.com/support/knowledgebase/article.aspx/10383/2176/how-to-set-up-a-dkim-record-for-private-email/), [Infomaniak MX](https://www.infomaniak.com/en/support/faq/2110/manage-mx-records), [Infomaniak SPF](https://www.infomaniak.com/en/support/faq/2199/manage-spf-records)

## 6. Domain hygiene

- **Auto-renew:** Namecheap **Domain List**: switch **Auto-Renew** on for `alfine.ch` and keep a valid payment method on file. A lapsed domain takes the website and email down together.
- **DNSSEC:** recommended. On BasicDNS it is a toggle under **Advanced DNS > DNSSEC**; Namecheap sets the values and it takes effect in about an hour. Namecheap's list of unsupported TLDs does not include `.ch`, but it does not explicitly confirm `.ch` either; if the toggle is missing for this domain, ask Namecheap support. Enable it after the website and mail records are working.
- **Registrar lock:** keep the domain locked against transfers.
- **WHOIS:** since 1 January 2021 the `.ch` registry (SWITCH) no longer publishes holders' personal data in WHOIS, so no privacy add-on is needed for `.ch`.

Sources: [Namecheap DNSSEC](https://www.namecheap.com/support/knowledgebase/article.aspx/9723/2232/managing-dnssec-for-domains-pointed-to-premium-or-basicdns/), [DNSSEC TLD support](https://www.namecheap.com/support/knowledgebase/article.aspx/9718/2232/nameservers-and-tlds-supportedunsupported-by-dnssec/), [nic.ch WHOIS](https://www.nic.ch/whois/domaininfo/)

## Response headers

GitHub Pages sets the HTTP response headers itself and does not allow custom ones. The site compensates with a `<meta>` Content-Security-Policy and referrer policy. See "Security and privacy" in the README for the headers that cannot be set and the Cloudflare option.
