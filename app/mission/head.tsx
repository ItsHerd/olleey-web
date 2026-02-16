const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olleey.com";
const title = "Our Mission | Olleey";
const description =
  "Learn how Olleey is building the global publishing layer for creators with multilingual automation and quality guardrails.";
const canonical = `${siteUrl}/mission`;

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Olleey" />
      <meta property="og:image" content={`${siteUrl}/herodashboard.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/herodashboard.png`} />
    </>
  );
}
