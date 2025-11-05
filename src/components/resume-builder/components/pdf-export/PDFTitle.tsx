import React from 'react';
import { View, Text } from '@react-pdf/renderer';

interface PDFTitleProps {
  title: string;
  styles: any;
}

export const PDFTitle: React.FC<PDFTitleProps> = ({ title, styles }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
    </View>
  );
};
