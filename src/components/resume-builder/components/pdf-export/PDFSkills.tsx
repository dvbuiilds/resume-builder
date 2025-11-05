import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Skills } from '../../types/resume-data';

interface PDFSkillsProps {
  skills: Skills;
  styles: any;
}

export const PDFSkills: React.FC<PDFSkillsProps> = ({ skills, styles }) => {
  if (!skills.skillSet || skills.skillSet.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{skills.title}</Text>
      <View style={styles.horizontalRule} />
      {skills.skillSet.map((skillSet, index) => (
        <View key={index} style={{ marginBottom: 8 }}>
          <Text style={styles.skillTitle}>{skillSet.title}</Text>
          <Text style={styles.skillList}>{skillSet.skills.join(' • ')}</Text>
        </View>
      ))}
    </View>
  );
};
