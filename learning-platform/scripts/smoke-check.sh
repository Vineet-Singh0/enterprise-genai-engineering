#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."
DOC=dist/domains/agt/agt-01-agent-systems-foundations/01-agent-definition-and-system-boundaries/index.html
echo "DOC_BYTES=$(wc -c < "$DOC")"
for token in shiki mermaid code-block data-pagefind-body prose; do
  count=$(grep -o "$token" "$DOC" | wc -l || true)
  echo "$token=$count"
done
grep -c "Mark completed" "$DOC" || true
echo "HTML_PAGES=$(find dist -name index.html | wc -l)"
echo "DOMAINS=$(ls dist/domains | grep -v index | wc -l)"
test -f dist/pagefind/pagefind-ui.js && echo PAGEFIND_OK
test -f dist/.nojekyll && echo NOJEKYLL_OK
test -f ../.github/workflows/pages.yml && echo WORKFLOW_OK
echo SMOKE_DONE
