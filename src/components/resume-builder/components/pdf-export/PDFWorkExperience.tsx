import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { WorkExperience } from '../../types/resume-data';

interface PDFWorkExperienceProps {
  workExperience: WorkExperience;
  styles: any;
}

export const PDFWorkExperience: React.FC<PDFWorkExperienceProps> = ({
  workExperience,
  styles,
}) => {
  if (!workExperience.experience || workExperience.experience.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{workExperience.title}</Text>
      <View style={styles.horizontalRule} />
      {workExperience.experience.map((exp, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.itemTitle, { fontWeight: 700 }]}>
                {exp.jobTitle}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  { fontWeight: 700, fontStyle: 'normal' },
                ]}
              >
                {exp.companyName}
              </Text>
            </View>
            <Text style={[styles.itemDate, { fontWeight: 700 }]}>
              {exp.startDate} - {exp.endDate}
            </Text>
          </View>
          {exp.description.map((desc, descIndex) => (
            <Text key={descIndex} style={styles.itemDescription}>
              • {desc}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
