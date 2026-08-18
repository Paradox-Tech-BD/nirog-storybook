// Nirog Storybook docs component: renders canonical Mermaid diagrams directly in the official Storybook docs preview.
import { createElement, useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

let configured = false;

type MermaidDiagramProps = {
  chart: string;
  title: string;
};

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const rawId = useId();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const diagramId = `nirog-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (!configured) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        flowchart: { curve: 'basis', htmlLabels: true },
      });
      configured = true;
    }

    setSvg('');
    setError('');
    void mermaid
      .render(diagramId, chart)
      .then(({ svg: renderedSvg }) => setSvg(renderedSvg))
      .catch(() => setError('The diagram source is available in the canonical documentation repository.'));
  }, [chart, rawId]);

  const content = svg
    ? createElement('div', { dangerouslySetInnerHTML: { __html: svg } })
    : createElement('p', null, error || 'Rendering diagram…');

  return createElement(
    'section',
    { 'aria-label': title, style: { margin: '1.5rem 0 2rem' } },
    createElement(
      'div',
      {
        style: {
          background: '#f8faf9',
          border: '1px solid #d6dfda',
          borderRadius: 8,
          overflow: 'auto',
          padding: '1.25rem',
        },
      },
      content
    )
  );
}
