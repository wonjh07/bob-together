import Link from 'next/link';

export default function DesignPage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>Design Playground</h1>
      <ul>
        <li>
          <Link href="/design/request-error-modal">
            RequestErrorModal Playground
          </Link>
        </li>
      </ul>
    </main>
  );
}
