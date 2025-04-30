import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import db from '../firebase' // Assuming your Firestore instance is in a separate file


function SavedWorkout() {
    const { workoutId } = useParams()
    const [inputs, setInputs] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchData = async () => {
        try {
            const docRef = doc(db, 'workoutLogs', workoutId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
            setInputs(docSnap.data())
            } else {
            setError('No such document found.')
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

        useEffect(() => {
        fetchData()
        }, [workoutId]) // Only re-fetch data when docId changes

// SavedWorkouts States
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (error) {
        return <div>Error: {error}</div>
    }
    if (!inputs) {
        return <div>No workout data found.</div>
    }

    return (

    )
    
      
}

export default SavedWorkout