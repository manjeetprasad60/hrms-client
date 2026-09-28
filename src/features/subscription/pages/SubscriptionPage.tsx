import { PageContainer } from '../../../layouts';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { UsageMeter } from '../components/UsageMeter';
export function SubscriptionPage() {
  return <PageContainer title="Subscription">
    <SubscriptionCard />
    <UsageMeter label="Employees" current={10} max={50} />
  </PageContainer>;
}