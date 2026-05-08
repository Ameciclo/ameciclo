export function Plausible({
  domain = "ameciclo.org",
  src = "https://plausible.ameciclo.org/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js",
}: {
  domain?: string;
  src?: string;
}) {
  return (
    <>
      <script defer data-domain={domain} src={src}></script>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }",
        }}
      ></script>
    </>
  );
}
