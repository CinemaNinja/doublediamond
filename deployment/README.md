# Double Diamond Website Deployment

This folder is the clean static deployment package for Double Diamond Moving & Storage.

## Deploy

Copy the contents of this `deployment` folder into the existing Double Diamond website directory on the server.

Primary entry point:

```text
index.html
```

No build step is required. This is a static HTML/CSS/JS site.

## Included

- `index.html` - main public website
- `login.html` - customer login page
- `portal.html` - customer portal handoff page
- `assets/` - site CSS and JavaScript
- `DD_ASSETS/` - only the media files referenced by the live site
- `robots.txt`
- `sitemap.xml`

## Optional Server Routes

The package includes small static redirect folders for the existing live-site clean URLs. These help preserve currently indexed or bookmarked paths even on a simple static server:

```text
/home/
/portal/
/interior-designer-services/
/storage/
/building-material-handling/
/art-handling/
/moving/
/our-experts/
/media/
```

If the existing server already handles redirects or rewrites, these equivalent mappings are safe to keep:

```text
/home -> /index.html
/customer-login -> https://accounts.doublediamondmoving.com/
/portal -> /portal.html
/interior-designer-services -> /#services
/storage -> /#services
/building-material-handling -> /#services
/art-handling -> /#services
/moving -> /#services
/our-experts -> /#experts
/media -> /#media
```

The site also works without these rewrites by opening `index.html`, `login.html`, and `portal.html` directly.
