import { EntityManager } from '@mikro-orm/postgresql';
import { Metrics } from '@/modules/metrics';
import { scopedLogger } from '@/services/logger';
import { User } from '@/db/models/User';

const log = scopedLogger('metrics');

export async function updateMetrics(em: EntityManager, metrics: Metrics) {
  log.info('Updating user metrics...');

  try {
    const users = await em
      .createQueryBuilder(User)
      .select(['namespace', 'COUNT(*) AS count'])
      .groupBy('namespace')
      .execute<{ namespace: string; count: string }[]>();

    metrics.user.reset();

    users.forEach((v: { namespace: string; count: string }) => {
      log.info(`Updating metric for namespace: ${v.namespace}, count: ${v.count}`);
      metrics.user.labels({ namespace: v.namespace }).inc(Number(v.count));
    });
  } catch (error) {
    log.error('Error updating user metrics', error);
  }
}
