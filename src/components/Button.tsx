import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

/** The brand's single interactive-affordance primitive. Hover = one step
 * deeper in the cobalt scale; press = deeper still + a slight scale-down. */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[size], disabled ? styles.disabled : styles[variant], className]
    .filter(Boolean)
    .join(' ');
  return <button className={classes} disabled={disabled} {...rest} />;
}
