
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';

const categories = [
  'Medical Emergency',
  'Road Accident',
  'Fire Emergency',
  'Harassment',
  'Other Emergency',
];

const initialRequests = [
  {
    id: 'ER-001',
    category: 'Medical Emergency',
    description: 'A person needs immediate medical assistance.',
    location: 'Gulberg, Lahore',
    status: 'Pending',
    citizenName: 'Demo Citizen',
  },
  {
    id: 'ER-002',
    category: 'Road Accident',
    description: 'A road accident has been reported. Assistance is needed.',
    location: 'Model Town, Lahore',
    status: 'Pending',
    citizenName: 'Demo Citizen',
  },
  {
    id: 'ER-003',
    category: 'Fire Emergency',
    description: 'Smoke and fire reported in a residential building.',
    location: 'Johar Town, Lahore',
    status: 'In Progress',
    citizenName: 'Demo Citizen',
  },
];

export default function App() {
  const [screen, setScreen] = useState('login');
  const [accountType, setAccountType] = useState('Citizen');
  const [adminTab, setAdminTab] = useState('users');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [citizenUser, setCitizenUser] = useState(null);
  const [volunteerUser, setVolunteerUser] = useState(null);

  const [sampleRequests, setSampleRequests] = useState(initialRequests);
  const [emergencyReports, setEmergencyReports] = useState([]);

  const [emergencyCategory, setEmergencyCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const currentUser =
    accountType === 'Citizen' ? citizenUser : volunteerUser;

  const handleRegister = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: accountType,
    };

    if (accountType === 'Citizen') {
      setCitizenUser(newUser);
    } else {
      setVolunteerUser(newUser);
    }

    setLoginEmail(newUser.email);
    setLoginPassword('');

    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');

    setScreen('login');

    Alert.alert(
      `${accountType} Registration Successful`,
      'Your account has been created. Please log in.'
    );
  };

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert('Missing Information', 'Enter your email and password.');
      return;
    }

    if (accountType === 'Admin') {
      if (
        loginEmail.trim().toLowerCase() === 'admin@emergix.ai' &&
        loginPassword === 'admin123'
      ) {
        setScreen('adminHome');
      } else {
        Alert.alert('Login Failed', 'Incorrect admin email or password.');
      }
      return;
    }

    if (!currentUser) {
      Alert.alert(
        'Account Not Found',
        `Please register as a ${accountType.toLowerCase()} first.`
      );
      return;
    }

    if (
      loginEmail.trim().toLowerCase() === currentUser.email &&
      loginPassword === currentUser.password
    ) {
      setScreen(accountType === 'Citizen' ? 'home' : 'volunteerHome');
    } else {
      Alert.alert('Login Failed', 'Incorrect email or password.');
    }
  };

  const handleLogout = () => {
    setLoginPassword('');
    setLoginEmail('');
    setScreen('login');
  };

  const handleAcceptRequest = (requestId) => {
    setSampleRequests((previousRequests) =>
      previousRequests.map((request) =>
        request.id === requestId
          ? { ...request, status: 'Accepted' }
          : request
      )
    );

    setEmergencyReports((previousReports) =>
      previousReports.map((report) =>
        report.id === requestId
          ? { ...report, status: 'Accepted' }
          : report
      )
    );

    Alert.alert(
      'Request Accepted',
      `You have accepted emergency request ${requestId}.`
    );
  };

  const handleRemoveUser = (role) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove this ${role.toLowerCase()} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (role === 'Citizen') {
              setCitizenUser(null);
            } else {
              setVolunteerUser(null);
            }

            Alert.alert('User Removed', `${role} account has been removed.`);
          },
        },
      ]
    );
  };

  const openEditProfile = () => {
    setName(citizenUser.name);
    setPhone(citizenUser.phone);
    setScreen('editProfile');
  };

  const handleUpdateProfile = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        'Missing Information',
        'Name and phone number are required.'
      );
      return;
    }

    setCitizenUser({
      ...citizenUser,
      name: name.trim(),
      phone: phone.trim(),
    });

    setScreen('profile');
    Alert.alert('Profile Updated', 'Your profile has been updated.');
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow location access in your iPhone Settings.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setGpsLocation({ latitude, longitude });

      setLocation(
        `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
      );

      Alert.alert('Location Found', 'Your GPS location has been added.');
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  
const handleEmergencySubmit = () => {
  if (!emergencyCategory || !description.trim() || !location.trim()) {
    Alert.alert(
      'Missing Information',
      'Select a category and enter description and location.'
    );
    return;
  }

  const newReport = {
    id: `REPORT-${Date.now()}`,
    citizenName: citizenUser.name,
    category: emergencyCategory,
    description: description.trim(),
    location: location.trim(),
    status: 'Submitted',
  };

  setEmergencyReports((previousReports) => [
    newReport,
    ...previousReports,
  ]);

  setSampleRequests((previousRequests) => [
    {
      id: newReport.id,
      category: newReport.category,
      description: newReport.description,
      location: newReport.location,
      status: 'Pending',
      citizenName: newReport.citizenName,
    },
    ...previousRequests,
  ]);

  Alert.alert(
    'Debug Test',
    `Volunteer requests updated.\n\nReport ID: ${newReport.id}\nCategory: ${newReport.category}\nCitizen: ${newReport.citizenName}`
  );

  setEmergencyCategory('');
  setDescription('');
  setLocation('');
  setGpsLocation(null);
  setScreen('home');
};


  const renderLogin = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Login</Text>
      <Text style={styles.subtitle}>Choose your account type</Text>

      <View style={styles.roleRow}>
        {['Citizen', 'Volunteer', 'Admin'].map((role) => (
          <Pressable
            key={role}
            style={[
              styles.roleButton,
              accountType === role && styles.selectedRole,
            ]}
            onPress={() => {
              setAccountType(role);
              setLoginPassword('');
              setLoginEmail('');
            }}
          >
            <Text
              style={[
                styles.roleText,
                accountType === role && styles.selectedRoleText,
              ]}
            >
              {role}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={loginEmail}
        onChangeText={setLoginEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={loginPassword}
        onChangeText={setLoginPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login as {accountType}</Text>
      </Pressable>

      {accountType !== 'Admin' && (
        <Pressable
          style={styles.secondaryButton}
          onPress={() => setScreen('register')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </Pressable>
      )}

      {accountType === 'Admin' && (
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            Demo: admin@emergix.ai / admin123
          </Text>
        </View>
      )}
    </>
  );

  const renderRegistration = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>{accountType} Registration</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <Text style={styles.fieldLabel}>Register As</Text>

      <View style={styles.roleRow}>
        {['Citizen', 'Volunteer'].map((role) => (
          <Pressable
            key={role}
            style={[
              styles.roleButton,
              accountType === role && styles.selectedRole,
            ]}
            onPress={() => setAccountType(role)}
          >
            <Text
              style={[
                styles.roleText,
                accountType === role && styles.selectedRoleText,
              ]}
            >
              {role}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register as {accountType}</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen('login')}
      >
        <Text style={styles.secondaryButtonText}>Back to Login</Text>
      </Pressable>
    </>
  );

  const renderHome = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Welcome, {citizenUser.name}!</Text>
      <Text style={styles.subtitle}>Citizen Home</Text>

      <Text style={styles.homeDescription}>
        Need help? Report an emergency below.
      </Text>

      <Pressable
        style={styles.sosButton}
        onPress={() => setScreen('emergency')}
      >
        <Text style={styles.sosButtonText}>SOS</Text>
        <Text style={styles.sosSubtext}>REPORT AN EMERGENCY</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => setScreen('profile')}>
        <Text style={styles.buttonText}>My Profile</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleLogout}>
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </>
  );

  const renderVolunteerHome = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Welcome, {volunteerUser.name}!</Text>
      <Text style={styles.subtitle}>Volunteer Dashboard</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileValue}>Volunteer Account</Text>
        <Text style={styles.profileLabel}>
          You are logged in as a volunteer.
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => setScreen('requests')}
      >
        <Text style={styles.buttonText}>View Emergency Requests</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleLogout}>
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </>
  );

  const renderRequests = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Emergency Requests</Text>
      <Text style={styles.subtitle}>
        Available emergency requests for volunteers
      </Text>

      <View style={styles.demoNotice}>
        <Text style={styles.demoNoticeText}>
          Newly submitted citizen reports appear here
        </Text>
      </View>

      {sampleRequests.map((request) => (
        <View style={styles.requestCard} key={request.id}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestId}>{request.id}</Text>
            <Text
              style={[
                styles.status,
                request.status === 'Pending'
                  ? styles.pendingStatus
                  : request.status === 'Accepted'
                  ? styles.acceptedStatus
                  : styles.progressStatus,
              ]}
            >
              {request.status}
            </Text>
          </View>

          <Text style={styles.requestCategory}>{request.category}</Text>

          <Text style={styles.requestLabel}>Description</Text>
          <Text style={styles.requestValue}>{request.description}</Text>

          <Text style={styles.requestLabel}>Location</Text>
          <Text style={styles.requestValue}>{request.location}</Text>

          {request.citizenName && (
            <>
              <Text style={styles.requestLabel}>Reported By</Text>
              <Text style={styles.requestValue}>{request.citizenName}</Text>
            </>
          )}

          {request.status === 'Pending' && (
            <Pressable
              style={styles.acceptButton}
              onPress={() => handleAcceptRequest(request.id)}
            >
              <Text style={styles.buttonText}>Accept Request</Text>
            </Pressable>
          )}

          {request.status === 'Accepted' && (
            <View style={styles.acceptedButton}>
              <Text style={styles.acceptedButtonText}>
                Request Accepted
              </Text>
            </View>
          )}
        </View>
      ))}

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen('volunteerHome')}
      >
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
      </Pressable>
    </>
  );

  const renderAdminHome = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage users and emergency reports</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{citizenUser ? 1 : 0}</Text>
          <Text style={styles.statLabel}>Citizens</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{volunteerUser ? 1 : 0}</Text>
          <Text style={styles.statLabel}>Volunteers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{emergencyReports.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
      </View>

      <View style={styles.roleRow}>
        <Pressable
          style={[
            styles.tabButton,
            adminTab === 'users' && styles.selectedRole,
          ]}
          onPress={() => setAdminTab('users')}
        >
          <Text
            style={[
              styles.roleText,
              adminTab === 'users' && styles.selectedRoleText,
            ]}
          >
            Manage Users
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            adminTab === 'reports' && styles.selectedRole,
          ]}
          onPress={() => setAdminTab('reports')}
        >
          <Text
            style={[
              styles.roleText,
              adminTab === 'reports' && styles.selectedRoleText,
            ]}
          >
            Reports
          </Text>
        </Pressable>
      </View>

      {adminTab === 'users' && (
        <>
          <Text style={styles.sectionHeading}>Registered Citizens</Text>

          {citizenUser ? (
            <View style={styles.adminCard}>
              <Text style={styles.requestCategory}>Citizen</Text>
              <Text style={styles.requestValue}>{citizenUser.name}</Text>
              <Text style={styles.requestValue}>{citizenUser.email}</Text>
              <Text style={styles.requestValue}>{citizenUser.phone}</Text>

              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveUser('Citizen')}
              >
                <Text style={styles.buttonText}>Remove Citizen</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.emptyText}>No registered citizens.</Text>
          )}

          <Text style={styles.sectionHeading}>Registered Volunteers</Text>

          {volunteerUser ? (
            <View style={styles.adminCard}>
              <Text style={styles.requestCategory}>Volunteer</Text>
              <Text style={styles.requestValue}>{volunteerUser.name}</Text>
              <Text style={styles.requestValue}>{volunteerUser.email}</Text>
              <Text style={styles.requestValue}>{volunteerUser.phone}</Text>

              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveUser('Volunteer')}
              >
                <Text style={styles.buttonText}>Remove Volunteer</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.emptyText}>No registered volunteers.</Text>
          )}
        </>
      )}

      {adminTab === 'reports' && (
        <>
          <Text style={styles.sectionHeading}>Emergency Reports</Text>

          {emergencyReports.length === 0 ? (
            <Text style={styles.emptyText}>
              No emergency reports submitted yet.
            </Text>
          ) : (
            emergencyReports.map((report) => (
              <View style={styles.adminCard} key={report.id}>
                <Text style={styles.requestId}>{report.id}</Text>
                <Text style={styles.requestCategory}>
                  {report.category}
                </Text>

                <Text style={styles.requestLabel}>Reported By</Text>
                <Text style={styles.requestValue}>
                  {report.citizenName}
                </Text>

                <Text style={styles.requestLabel}>Description</Text>
                <Text style={styles.requestValue}>
                  {report.description}
                </Text>

                <Text style={styles.requestLabel}>Location</Text>
                <Text style={styles.requestValue}>
                  {report.location}
                </Text>

                <Text style={styles.requestLabel}>Status</Text>
                <Text style={styles.requestValue}>{report.status}</Text>
              </View>
            ))
          )}
        </>
      )}

      <Pressable style={styles.secondaryButton} onPress={handleLogout}>
        <Text style={styles.secondaryButtonText}>Admin Logout</Text>
      </Pressable>
    </>
  );

  const renderProfile = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Citizen Profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Full Name</Text>
        <Text style={styles.profileValue}>{citizenUser.name}</Text>

        <Text style={styles.profileLabel}>Email Address</Text>
        <Text style={styles.profileValue}>{citizenUser.email}</Text>

        <Text style={styles.profileLabel}>Phone Number</Text>
        <Text style={styles.profileValue}>{citizenUser.phone}</Text>
      </View>

      <Pressable style={styles.button} onPress={openEditProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen('home')}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </Pressable>
    </>
  );

  const renderEditProfile = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Update Profile</Text>

      <Text style={styles.fieldLabel}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.fieldLabel}>Email Address</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={citizenUser.email}
        editable={false}
      />

      <Text style={styles.fieldLabel}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Pressable style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen('profile')}
      >
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </>
  );

  const renderEmergency = () => (
    <>
      <Text style={styles.logo}>EMERGIX AI</Text>
      <Text style={styles.heading}>Report Emergency</Text>
      <Text style={styles.subtitle}>Provide emergency details</Text>

      <Text style={styles.fieldLabel}>Emergency Category</Text>

      {categories.map((category) => (
        <Pressable
          key={category}
          style={[
            styles.categoryButton,
            emergencyCategory === category && styles.selectedCategory,
          ]}
          onPress={() => setEmergencyCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              emergencyCategory === category &&
                styles.selectedCategoryText,
            ]}
          >
            {category}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Describe what happened..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.fieldLabel}>Emergency Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location manually or use GPS"
        value={location}
        onChangeText={(value) => {
          setLocation(value);
          setGpsLocation(null);
        }}
      />

      <Pressable
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.buttonText}>
          {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
        </Text>
      </Pressable>

      {gpsLocation && (
        <Text style={styles.gpsText}>
          GPS coordinates captured successfully
        </Text>
      )}

      <Pressable
        style={styles.submitButton}
        onPress={handleEmergencySubmit}
      >
        <Text style={styles.buttonText}>Submit Emergency Report</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen('home')}
      >
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {screen === 'login' && renderLogin()}
        {screen === 'register' && renderRegistration()}
        {screen === 'home' && citizenUser && renderHome()}
        {screen === 'volunteerHome' &&
          volunteerUser &&
          renderVolunteerHome()}
        {screen === 'requests' &&
          volunteerUser &&
          renderRequests()}
        {screen === 'adminHome' && renderAdminHome()}
        {screen === 'profile' && citizenUser && renderProfile()}
        {screen === 'editProfile' &&
          citizenUser &&
          renderEditProfile()}
        {screen === 'emergency' &&
          citizenUser &&
          renderEmergency()}

        <Text style={styles.footer}>Emergency Response System</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F8F3',
    justifyContent: 'center',
    padding: 25,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#315B3A',
    textAlign: 'center',
    marginBottom: 25,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263D2B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  homeDescription: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 15,
  },
  descriptionInput: {
    minHeight: 110,
  },
  disabledInput: {
    backgroundColor: '#E8EDE6',
    color: '#777777',
  },
  button: {
    backgroundColor: '#315B3A',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#E3EBDD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#315B3A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED2',
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED2',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#315B3A',
    borderColor: '#315B3A',
  },
  roleText: {
    color: '#263D2B',
    fontWeight: 'bold',
    fontSize: 13,
  },
  selectedRoleText: {
    color: '#FFFFFF',
  },
  sosButton: {
    backgroundColor: '#D92D2D',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
  },
  sosSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 5,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D5DED2',
  },
  profileLabel: {
    color: '#777777',
    fontSize: 13,
    marginTop: 12,
  },
  profileValue: {
    color: '#263D2B',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
  },
  fieldLabel: {
    color: '#263D2B',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#315B3A',
    borderColor: '#315B3A',
  },
  categoryText: {
    color: '#263D2B',
    fontSize: 15,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  locationButton: {
    backgroundColor: '#477D9B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  gpsText: {
    color: '#315B3A',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#D92D2D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  demoNotice: {
    backgroundColor: '#FFF2D8',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 18,
  },
  demoNoticeText: {
    color: '#805A17',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    color: '#777777',
    fontWeight: 'bold',
    fontSize: 13,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pendingStatus: {
    color: '#805A17',
    backgroundColor: '#FFF2D8',
  },
  progressStatus: {
    color: '#235B8A',
    backgroundColor: '#E0F0FF',
  },
  acceptedStatus: {
    color: '#315B3A',
    backgroundColor: '#E3EBDD',
  },
  requestCategory: {
    color: '#315B3A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  requestLabel: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  requestValue: {
    color: '#263D2B',
    fontSize: 15,
    marginTop: 4,
    lineHeight: 21,
  },
  acceptButton: {
    backgroundColor: '#315B3A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  acceptedButton: {
    backgroundColor: '#E3EBDD',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  acceptedButtonText: {
    color: '#315B3A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DED2',
  },
  statNumber: {
    color: '#315B3A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#777777',
    fontSize: 12,
    marginTop: 5,
  },
  sectionHeading: {
    color: '#263D2B',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 12,
  },
  adminCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D5DED2',
    marginBottom: 15,
  },
  removeButton: {
    backgroundColor: '#C83D3D',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },
  emptyText: {
    color: '#777777',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 30,
  },
});
