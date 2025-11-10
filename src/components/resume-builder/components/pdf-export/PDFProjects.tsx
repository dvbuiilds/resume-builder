import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Projects } from '../../types/resume-data';

interface PDFProjectsProps {
  projects: Projects;
  styles: any;
}

export const PDFProjects: React.FC<PDFProjectsProps> = ({
  projects,
  styles,
}) => {
  if (!projects.projects || projects.projects.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{projects.title}</Text>
      <View style={styles.horizontalRule} />
      {projects.projects.map((project, index) => (
        <View key={index} style={{ marginBottom: 4 }}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.itemTitle, { fontWeight: 700 }]}>
                {project.projectTitle}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  { fontWeight: 700, fontStyle: 'normal' },
                ]}
              >
                {project.organizationName}
              </Text>
            </View>
            <Text style={[styles.itemDate, { fontWeight: 700 }]}>
              {project.startDate} - {project.endDate}
            </Text>
          </View>
          {project.description.map((desc, descIndex) => (
            <Text key={descIndex} style={styles.itemDescription}>
              • {desc}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
