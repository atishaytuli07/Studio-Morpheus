import { ArrowSwap } from "./Icons";

/* The site's one button: a chip with its label and the blue arrow square,
   the arrow swapping on hover. `light` on navy grounds, `dark` on bone.
   Any extra props (aria-*, tabIndex, onClick…) go straight to the link. */
export default function Button({ href, variant = "light", className = "", children, ...rest }) {
  return (
    <a href={href} className={`button button--${variant} ${className}`.trim()} {...rest}>
      {children}
      <ArrowSwap />
    </a>
  );
}
