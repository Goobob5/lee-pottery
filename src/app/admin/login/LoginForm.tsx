'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/lib/admin-actions';
import styles from '../admin.module.css';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} action={action}>
        <h1 className={styles.loginBrand}>Lee Pottery — workbench</h1>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.input}
            autoFocus
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && <span className={styles.error}>{state.error}</span>}
        <button className={styles.btn} type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Let me in'}
        </button>
      </form>
    </div>
  );
}
