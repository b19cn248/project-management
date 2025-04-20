import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const MeetingForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    return (
        <MainLayout title={isEditMode ? 'Edit Meeting' : 'Create Meeting'}>
            <Card>
                <div className="text-center py-6">
                    <p>Meeting {isEditMode ? 'edit' : 'create'} form</p>
                    <p className="text-gray-500 mt-2">This feature is under development.</p>
                    <div className="mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/meetings')}
                            className="mr-2"
                        >
                            Back to Meetings
                        </Button>
                    </div>
                </div>
            </Card>
        </MainLayout>
    );
};

export default MeetingForm;