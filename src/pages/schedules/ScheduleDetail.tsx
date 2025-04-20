import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ScheduleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <MainLayout title="Schedule Detail">
            <Card>
                <div className="text-center py-6">
                    <p>Schedule detail view for ID: {id}</p>
                    <p className="text-gray-500 mt-2">This feature is under development.</p>
                    <Link to="/schedules" className="mt-4 inline-block">
                        <Button variant="primary">Back to Schedules</Button>
                    </Link>
                </div>
            </Card>
        </MainLayout>
    );
};

export default ScheduleDetail;