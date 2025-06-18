// src/components/background-image.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { FC } from 'react';

interface LogoCompletProps extends Omit<ImageProps, 'src' | 'alt'> {
  imagePath: string;
  altText?: string;
  overlayClassName?: string;
}

const LogoComplet: FC<LogoCompletProps> = ({
                                                     imagePath='/images/logo-complet.png',
                                                     altText = 'Background Image',
                                                     overlayClassName = '',
                                                     ...props
                                                   }) => {
  return (
    <div className="relative h-full w-full">
      <Image
        src={imagePath}
        alt={altText}
        fill
        sizes="300px"
        priority
        className={overlayClassName}
        {...props}
      />
    </div>
  );
};

export default LogoComplet;