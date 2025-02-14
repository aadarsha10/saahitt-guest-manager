
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #FF6F00',
    paddingBottom: 10,
  },
  headerLogo: {
    width: 120,
    height: 40,
    marginRight: 20,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6F00',
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6F00',
    paddingBottom: 6,
    marginBottom: 8,
    backgroundColor: '#FFF5E6',
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingVertical: 6,
    minHeight: 50,
  },
  col1: { width: '20%', fontSize: 9 },
  col2: { width: '12%', fontSize: 9 },
  col3: { width: '12%', fontSize: 9 },
  col4: { width: '12%', fontSize: 9 },
  col5: { width: '22%', fontSize: 9 },
  col6: { width: '22%', fontSize: 9 },
  eventInfo: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#FFF5E6',
    borderRadius: 4,
    borderLeft: '3px solid #FF6F00',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderTop: '2px solid #FF6F00',
    paddingTop: 10,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
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
    fontSize: 10,
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  inviteSentBadge: {
    color: '#FF6F00',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  inviteDate: {
    fontSize: 7,
    color: '#666',
    marginTop: 1,
  },
  checklistContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    width: 8,
    height: 8,
    border: '1px solid #666',
    marginRight: 2,
  },
  checkboxLabel: {
    fontSize: 8,
    color: '#333',
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
          <Text style={styles.col6}>Checklist</Text>
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
                    Sent: {new Date(eventGuest.invite_sent_at).toLocaleDateString()}
                  </Text>
                )}
                {eventGuest?.invite_method && (
                  <Text style={styles.inviteDate}>
                    Via: {eventGuest.invite_method}
                  </Text>
                )}
              </View>
              <View style={[styles.col6, styles.checklistContainer]}>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checkboxLabel}>Arrived</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checkboxLabel}>Plus One</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checkboxLabel}>Gift Received</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checkboxLabel}>Thank You Sent</Text>
                </View>
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
