import ReviewEditorClient from './ReviewEditorClient';

type ReviewEditorPageProps = {
  params: {
    appointmentId: string;
  };
};

export default function ReviewEditorPage({ params }: ReviewEditorPageProps) {
  return <ReviewEditorClient appointmentId={params.appointmentId} />;
}
