
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingVertical: 8,
  },
  col1: { width: '25%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '35%' },
  checkbox: {
    border: '1px solid black',
    width: 12,
    height: 12,
    marginRight: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  eventInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
});

interface GuestListPDFProps {
  guests: Guest[];
  event?: Event;
  eventGuests?: EventGuest[];
}

export const GuestListPDF = ({ guests, event, eventGuests }: GuestListPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          {event ? `Guest List - ${event.name}` : 'Complete Guest List'}
        </Text>

        {event && (
          <View style={styles.eventInfo}>
            <Text>Event: {event.name}</Text>
            <Text>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not set'}</Text>
            <Text>Description: {event.description || 'No description'}</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.col1}>Name</Text>
          <Text style={styles.col2}>Category</Text>
          <Text style={styles.col3}>Status</Text>
          <Text style={styles.col4}>Tracking</Text>
        </View>

        {guests.map((guest) => {
          const eventGuest = eventGuests?.find(eg => eg.guest_id === guest.id);
          return (
            <View key={guest.id} style={styles.row}>
              <Text style={styles.col1}>
                {guest.first_name} {guest.last_name}
              </Text>
              <Text style={styles.col2}>{guest.category}</Text>
              <Text style={styles.col3}>{guest.status}</Text>
              <View style={styles.col4}>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text>Invite Sent {eventGuest?.invite_sent ? '✓' : ''}</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text>Arrived</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text>+1</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text>Family Group</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
