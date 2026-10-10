"use client";

import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Field from "./Field";

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      right={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-placeholder transition-colors hover:text-primary"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
        </button>
      }
    />
  );
}
