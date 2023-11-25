import * as React from "react";
import { Image, tokens, makeStyles } from "@fluentui/react-components";

export interface HeaderProps {
  title: string;
  logo: string;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { title, logo } = props;

  return (
    <div>
      <section className="addin-header d-flex-row-center">
        <Image width="90" height="90" src={logo} alt={title} />
      </section>
    </div>
  );
};

export default Header;
