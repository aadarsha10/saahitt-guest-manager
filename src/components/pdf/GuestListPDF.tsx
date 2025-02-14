
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2px solid #FF6F00',
    paddingBottom: 15,
  },
  headerLogo: {
    width: 150,
    height: 50,
    marginRight: 20,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6F00',
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6F00',
    paddingBottom: 8,
    marginBottom: 12,
    backgroundColor: '#FFF5E6',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingVertical: 10,
  },
  col1: { width: '25%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '30%' },
  eventInfo: {
    marginBottom: 25,
    padding: 12,
    backgroundColor: '#FFF5E6',
    borderRadius: 4,
    borderLeft: '3px solid #FF6F00',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    borderTop: '2px solid #FF6F00',
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
  },
  footerLeft: {
    flex: 1,
    color: '#FF6F00',
  },
  footerCenter: {
    flex: 1,
    textAlign: 'center',
    color: '#FF6F00',
  },
  footerRight: {
    flex: 1,
    textAlign: 'right',
    color: '#FF6F00',
  },
  tagline: {
    fontSize: 12,
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inviteSentBadge: {
    color: '#FF6F00',
    fontFamily: 'Helvetica-Bold',
  },
  inviteDate: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
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
        <View style={styles.header}>
          <Image
            src="/lovable-uploads/a36de6e2-9eba-4c99-95c9-361c97bd7293.png"
            style={styles.headerLogo}
          />
          <Text style={styles.headerText}>
            Guest Management Tool by Saahitt
          </Text>
        </View>

        <Text style={styles.tagline}>
          Making event planning easier, one guest list at a time
        </Text>

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

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Name</Text>
          <Text style={styles.col2}>Category</Text>
          <Text style={styles.col3}>Priority</Text>
          <Text style={styles.col4}>Status</Text>
          <Text style={styles.col5}>Invite Status</Text>
        </View>

        {guests.map((guest) => {
          const eventGuest = eventGuests?.find(eg => eg.guest_id === guest.id);
          return (
            <View key={guest.id} style={styles.row}>
              <Text style={styles.col1}>
                {guest.first_name} {guest.last_name}
              </Text>
              <Text style={styles.col2}>{guest.category}</Text>
              <Text style={styles.col3}>{guest.priority}</Text>
              <Text style={styles.col4}>{guest.status}</Text>
              <View style={styles.col5}>
                <Text style={styles.inviteSentBadge}>
                  {eventGuest?.invite_sent ? '✓ Invite Sent' : '⧖ Pending'}
                </Text>
                {eventGuest?.invite_sent_at && (
                  <Text style={styles.inviteDate}>
                    Sent on: {new Date(eventGuest.invite_sent_at).toLocaleDateString()}
                  </Text>
                )}
                {eventGuest?.invite_method && (
                  <Text style={styles.inviteDate}>
                    Via: {eventGuest.invite_method}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text>Powered by Saahitt</Text>
              <Text>Contact: support@saahitt.com</Text>
            </View>
            <View style={styles.footerCenter}>
              <Text>Event Planning Made Simple</Text>
              <Text>Visit: www.saahitt.com</Text>
            </View>
            <View style={styles.footerRight}>
              <Text>Generated by Guest Management Tool</Text>
              <Text>Page 1</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
