import * as styles from './NextButton.css';

interface NextButtonProps {
  handleNext: () => void;
}

export default function NextButton({ handleNext }: NextButtonProps) {
  return (
    <div className={styles.buttonContainer}>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={handleNext}>
        다음
      </button>
    </div>
  );
}
