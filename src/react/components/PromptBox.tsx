import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {callScript} from '../CallScript';
import axios from 'axios'

export default function PromptBox() {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [accountID, setAccountID] = useState('');
    const [FilteredDOM, setFilteredDOM] = useState([])

    // This State Holds if the microphone is currently capturing your audio
    const [capturing, setCapturing] = useState(false);
    const [prevCapturing, setPrevCapturing] = useState(false);

    // Retrieve Name and AccountID from Storage
    useEffect(() => {
        const handleResponse = (event: any) => {
            const {detail} = event;
            if (detail.action === 'getDataFromStorage') {
                if (detail.key === 'name' && detail.status === 'success') {
                    setName(detail.value || '');
                } else if (detail.key === 'accountID' && detail.status === 'success') {
                    setAccountID(detail.value || '');
                }
            }
        };

        window.addEventListener('myExtensionResponse', handleResponse);

        // Fetching both name and accountID
        callScript('getDataFromStorage', {key: 'name'});
        callScript('getDataFromStorage', {key: 'accountID'});

        return () => {
            window.removeEventListener('myExtensionResponse', handleResponse);
        };
    }, []);

    // Event Listener for Transcript/Audio Data
    useEffect(() => {
        const handleSpeechData = (event: any) => {
            const {finalTranscript, capturing} = event.detail;

            if (capturing && !prevCapturing) {
                // Reset message when transitioning from not capturing to capturing
                setMessage('');
            } else {
                setMessage(finalTranscript);
            }

            setPrevCapturing(capturing); // Update the previous capturing state
            setCapturing(capturing); // Update the capturing state
        };

        window.addEventListener('myExtensionSpeechData', handleSpeechData);

        return () => {
            window.removeEventListener('myExtensionSpeechData', handleSpeechData);
        };
    }, [prevCapturing]);

    // Get Filtered DOM
    useEffect(() => {
        const handleSearchNodes = (event: any) => {
            const {searchNodes} = event.detail;
            setFilteredDOM(searchNodes);
        };

        window.addEventListener('myExtensionSearchNodes', handleSearchNodes);

        return () => {
            window.removeEventListener('myExtensionSearchNodes', handleSearchNodes);
        };
    }, []);

    // Sends Request to OpenAI
    const sendRequestToOpenAI = () => {
        if (!accountID) {
            console.log("Account ID is null, not sending request.");
            return;
        }

        // ID of the Assistant/FineTuned Model we Created
        const engineID = "";

        const data = {
            name: name,
            message: message,
            DOM: FilteredDOM
        }

        console.log(data);

        // Send Request to GPT
        axios.post(`https://api.openai.com/v1/engines/${engineID}/completions`, {prompt: data, max_tokens: 150},
            {
                headers: {
                    'Authorization': `Bearer ${accountID}`,
                    'Content-Type': 'application/json',
                }
            })
            // Call Functions That GPT Wants to Run
            .then(response => {
                console.log(response.data);

                // PSEUDO CODE FOR NOW
                /* const functionsToCall = parseFunctions(response.data);
                functionsToCall.forEach((func: any) => {
                    callScript(func.name, {...func.args})
                }); */
            })
            // Any Errors will Post here
            .catch(error => {
                console.error("Error sending request to OpenAI:", error);
            });
    };

    useEffect(() => {
        // Check the transition from capturing (true) to not capturing (false)
        if (!capturing && prevCapturing) {
            sendRequestToOpenAI();
        }

        // Update the previous capturing state in the next render cycle
        // This ensures that the check for capturing state change is evaluated first
        const timeoutId = setTimeout(() => setPrevCapturing(capturing), 0);

        return () => clearTimeout(timeoutId);
    }, [capturing]); // Remove prevCapturing from dependencies


    return <PromptContainer capturing={capturing} value={message} onChange={(e) => setMessage(e.target.value)}/>
}

const PromptContainer = styled.textarea<{ capturing: boolean }>`
    width: 80%;
    border-radius: 10px;
    flex: 0.45;
    margin: 2rem;
    background: ${props => props.theme.primary};
    color: ${props => props.theme.accent};
    overflow: auto;
    resize: none;
    text-overflow: ellipsis;
    padding: 10px;
    border: none;
    line-height: 1.5;

    box-shadow: ${props => props.capturing ? '0px 0px 20px 5px rgba(0, 0, 0, 0.4)' : '0px 0px 10px 1px rgba(0, 0, 0, 0.2)'};
    transition: box-shadow 0.3s ease-in-out;
`;


