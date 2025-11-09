import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Activities } from '../../types/resume-data';

interface PDFActivitiesProps {
  activities: Activities;
  styles: any;
}

export const PDFActivities: React.FC<PDFActivitiesProps> = ({
  activities,
  styles,
}) => {
  if (!activities.activities || activities.activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{activities.title}</Text>
      <View style={styles.horizontalRule} />
      {activities.activities.map((activity, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.itemTitle, { fontWeight: 700 }]}>
                {activity.activityTitle}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  { fontWeight: 700, fontStyle: 'normal' },
                ]}
              >
                {activity.institutionName}
              </Text>
            </View>
            <Text style={[styles.itemDate, { fontWeight: 700 }]}>
              {activity.startDate} - {activity.endDate}
            </Text>
          </View>
          {activity.descriptions.map((desc, descIndex) => (
            <Text key={descIndex} style={styles.itemDescription}>
              • {desc}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
