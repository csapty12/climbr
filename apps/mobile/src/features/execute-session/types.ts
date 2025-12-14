import { ExerciseDetail } from '@climbr/shared';

// Route Params
export type ExecuteSessionStackParamList = {
    ConfigureSession: { exercise: ExerciseDetail };
    RunSession: { exercise: ExerciseDetail; config?: any }; // Config type will be refined later
    SessionSummary: { exercise: ExerciseDetail; result: any }; // Result type later
};
