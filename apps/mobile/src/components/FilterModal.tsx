import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback } from 'react-native';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

export const FilterModal = ({ visible, onClose, title, options, selectedValue, onSelect }: FilterModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.title}>{title}</Text>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const isSelected = item === selectedValue;
                                    return (
                                        <TouchableOpacity
                                            style={[styles.option, isSelected && styles.selectedOption]}
                                            onPress={() => {
                                                onSelect(item);
                                                onClose();
                                            }}
                                        >
                                            <View style={styles.radioCircle}>
                                                {isSelected && <View style={styles.selectedDot} />}
                                            </View>
                                            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#f9f9f9',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#444',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    optionText: {
        fontSize: 16,
    },
    selectedOptionText: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 8,
    },
    closeButtonText: {
        fontWeight: 'bold',
    },
});
