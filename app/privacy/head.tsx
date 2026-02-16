const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olleey.com";
const title = "Privacy Policy | Olleey";
const description = "Read Olleey's privacy policy to understand how we collect, use, and protect your data.";
const canonical = `${siteUrl}/privacy`;

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Olleey" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
