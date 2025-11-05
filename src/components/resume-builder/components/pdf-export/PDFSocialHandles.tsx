import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import type { SocialHandle } from '../../types/resume-data';

interface PDFSocialHandlesProps {
  socialHandles: Array<SocialHandle>;
  styles: any;
}

export const PDFSocialHandles: React.FC<PDFSocialHandlesProps> = ({
  socialHandles,
  styles,
}) => {
  return (
    <View style={styles.section}>
      <View
        style={[styles.row, { justifyContent: 'center', marginBottom: 10 }]}
      >
        {socialHandles.map((handle, index) => (
          <React.Fragment key={index}>
            {handle.link && handle.link !== '#' ? (
              <Link
                src={handle.link}
                style={[styles.link, { marginHorizontal: 8 }]}
              >
                {handle.label}
              </Link>
            ) : (
              <Text style={{ marginHorizontal: 8 }}>{handle.label}</Text>
            )}
            {index < socialHandles.length - 1 && <Text> • </Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};
