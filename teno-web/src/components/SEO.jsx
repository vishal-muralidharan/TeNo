import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url }) {
  const defaultTitle = "TeNo | Link Manager";
  const defaultDescription = "A personal link management and collaboration tool.";
  const siteUrl = "https://teno.example.com"; // [TODO: confirm production URL]
  
  const seo = {
    title: title ? `${title} | TeNo` : defaultTitle,
    description: description || defaultDescription,
    url: url ? `${siteUrl}${url}` : siteUrl,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
    </Helmet>
  );
}
