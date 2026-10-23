/* ============================================================================
   JSON-LD

   One component so every structured-data block on the site is serialised the
   same way. The content is built on the server from our own data, never from
   anything a visitor typed, so the only escaping that matters here is the one
   below: a literal "</script>" inside a JSON string would close the tag early
   and spill the rest of the graph into the document as markup. Splitting the
   "<" keeps the JSON byte-identical to a parser while the HTML tokeniser
   never sees a closing tag.
   ========================================================================= */

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
