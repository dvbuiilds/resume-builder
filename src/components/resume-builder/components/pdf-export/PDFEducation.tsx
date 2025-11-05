import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Education } from '../../types/resume-data';

interface PDFEducationProps {
  education: Education;
  styles: any;
}

export const PDFEducation: React.FC<PDFEducationProps> = ({
  education,
  styles,
}) => {
  if (!education.courses || education.courses.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{education.title}</Text>
      <View style={styles.horizontalRule} />
      {education.courses.map((course, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.itemTitle}>{course.courseName}</Text>
              <Text style={styles.itemSubtitle}>{course.institutionName}</Text>
            </View>
            <Text style={styles.itemDate}>
              {course.startDate} - {course.endDate}
            </Text>
          </View>
          <Text style={styles.itemDescription}>
            Score: {course.scoreEarned}
          </Text>
          {course.description && (
            <Text style={styles.itemDescription}>{course.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
};
