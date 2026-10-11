import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/NotFound.css"
export default function NotFoundPage() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const errorReasons = [
    "Арлан перекусил сетевой кабель",
    "Страницу затянула черная дыра в коде ",
    "Данные ушли на майнинг и не вернулись",
    "Сервер искал файл, но нашёл только <code>null</code>...",
    "Кажется, кто-то забыл сделать export default",
  ];

  const handleFixClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 3) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.glitchCode}>404</div>
        <h1 style={styles.title}>Сигнал потерян!</h1>
        <p style={styles.subtitle}>
          Запрошенный адрес не существует, был перемещен или сгорел при разгоне.
        </p>

        <div style={styles.terminalBox}>
          <div style={styles.terminalHeader}>
            <span style={{ ...styles.dot, backgroundColor: '#ff5f56' }} />
            <span style={{ ...styles.dot, backgroundColor: '#ffbd2e' }} />
            <span style={{ ...styles.dot, backgroundColor: '#27c93f' }} />
            <span style={styles.terminalTitle}>system_diag.log</span>
          </div>
          <div style={styles.terminalBody}>
            <span style={{ color: '#89b4fa' }}>$ error_log --check</span>
            <p style={styles.reasonText}>
              <strong style={{ color: '#f38ba8' }}>Причина: </strong>
              <span dangerouslySetInnerHTML={{ __html: errorReasons[clickCount % errorReasons.length] }} />
            </p>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={handleFixClick} style={styles.fixButton}>
            {clickCount >= 3 ? "⚡ Перезагрузка матрицы..." : `Починить систему (${clickCount}/3)`}
          </button>

          <div style={styles.linksRow}>
            <Link to="/" style={styles.linkButton}>На главную</Link>
            <Link to="/items" style={styles.linkButtonAccent}>В каталог</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '1rem',
  },
  card: {
    background: '#181825',
    color: '#cdd6f4',
    padding: '2.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    border: '1px solid #313244',
  },
  glitchCode: {
    fontSize: '6rem',
    fontWeight: '900',
    color: '#f38ba8',
    letterSpacing: '4px',
    lineHeight: '1',
    marginBottom: '0.5rem',
    textShadow: '0 0 25px rgba(243, 139, 168, 0.5)',
  },
  title: {
    fontSize: '1.75rem',
    margin: '0 0 0.5rem 0',
    color: '#cba6f7',
  },
  subtitle: {
    color: '#a6adc8',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
  },
  terminalBox: {
    background: '#11111b',
    borderRadius: '8px',
    border: '1px solid #45475a',
    textAlign: 'left',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  },
  terminalHeader: {
    background: '#1e1e2e',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid #313244',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  terminalTitle: {
    fontSize: '0.75rem',
    color: '#6c7086',
    marginLeft: 'auto',
    fontFamily: 'monospace',
  },
  terminalBody: {
    padding: '0.85rem',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
  },
  reasonText: {
    margin: '0.5rem 0 0 0',
    color: '#a6e3a1',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fixButton: {
    background: '#89b4fa',
    color: '#11111b',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  linksRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  linkButton: {
    flex: 1,
    color: '#cdd6f4',
    textDecoration: 'none',
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #45475a',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  linkButtonAccent: {
    flex: 1,
    color: '#89b4fa',
    textDecoration: 'none',
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #89b4fa',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
};