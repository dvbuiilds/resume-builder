import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Achievements } from '../../types/resume-data';

interface PDFAchievementsProps {
  achievements: Achievements;
  styles: any;
}

export const PDFAchievements: React.FC<PDFAchievementsProps> = ({
  achievements,
  styles,
}) => {
  if (
    !achievements.achievementList ||
    achievements.achievementList.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{achievements.title}</Text>
      <View style={styles.horizontalRule} />
      {achievements.achievementList.map((achievement, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.itemTitle}>{achievement.awardName}</Text>
              <Text style={styles.itemSubtitle}>
                {achievement.institutionName}
              </Text>
            </View>
            <Text style={styles.itemDate}>{achievement.dateAwarded}</Text>
          </View>
          {achievement.description && (
            <Text style={styles.itemDescription}>
              {achievement.description}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
