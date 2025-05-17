import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaxFitCard from '../../../components/MaxFit/MaxFitCard';
import ChatInterface from '../../../components/MaxFit/ChatInterface';

export default function MaxFitScreen() {
return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 15 : 0}
    >
        <View style={styles.header}>
            <MaxFitCard />
        </View>
        <View style={styles.chatArea}>
            <ChatInterface />
        </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#000000',
},
keyboardAvoidingView: {
    flex: 1,
},
header: {
    height: 200,
    padding: 10,
    backgroundColor: '#000000',
},
chatArea: {
    flex: 1,
},
});