const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olleey.com";
const title = "Contact Olleey";
const description =
  "Contact the Olleey team for enterprise onboarding, product demos, and multilingual workflow planning.";

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${siteUrl}/contact`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}/contact`} />
      <meta property="og:site_name" content="Olleey" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
