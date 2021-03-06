import { describe, it, expect } from 'test/lib/common';
import { InfluxQueryBuilder } from '../query_builder';

describe('InfluxQueryBuilder', function() {
  describe('when building explore queries', function() {
    it('should only have measurement condition in tag keys query given query with measurement', function() {
      var builder = new InfluxQueryBuilder({ measurement: 'cpu', tags: [] });
      var query = builder.buildExploreQuery('TAG_KEYS');
      expect(query).toBe('SHOW TAG KEYS FROM "cpu"');
    });

    it('should handle regex measurement in tag keys query', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '/.*/',
        tags: [],
      });
      var query = builder.buildExploreQuery('TAG_KEYS');
      expect(query).toBe('SHOW TAG KEYS FROM /.*/');
    });

    it('should have no conditions in tags keys query given query with no measurement or tag', function() {
      var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
      var query = builder.buildExploreQuery('TAG_KEYS');
      expect(query).toBe('SHOW TAG KEYS');
    });

    it('should have where condition in tag keys query with tags', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '',
        tags: [{ key: 'host', value: 'se1' }],
      });
      var query = builder.buildExploreQuery('TAG_KEYS');
      expect(query).toBe('SHOW TAG KEYS WHERE "host" = \'se1\'');
    });

    it('should have no conditions in measurement query for query with no tags', function() {
      var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
      var query = builder.buildExploreQuery('MEASUREMENTS');
      expect(query).toBe('SHOW MEASUREMENTS LIMIT 100');
    });

    it('should have no conditions in measurement query for query with no tags and empty query', function() {
      var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
      var query = builder.buildExploreQuery('MEASUREMENTS', undefined, '');
      expect(query).toBe('SHOW MEASUREMENTS LIMIT 100');
    });

    it('should have WITH MEASUREMENT in measurement query for non-empty query with no tags', function() {
      var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
      var query = builder.buildExploreQuery('MEASUREMENTS', undefined, 'something');
      expect(query).toBe('SHOW MEASUREMENTS WITH MEASUREMENT =~ /something/ LIMIT 100');
    });

    it('should have WITH MEASUREMENT WHERE in measurement query for non-empty query with tags', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '',
        tags: [{ key: 'app', value: 'email' }],
      });
      var query = builder.buildExploreQuery('MEASUREMENTS', undefined, 'something');
      expect(query).toBe('SHOW MEASUREMENTS WITH MEASUREMENT =~ /something/ WHERE "app" = \'email\' LIMIT 100');
    });

    it('should have where condition in measurement query for query with tags', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '',
        tags: [{ key: 'app', value: 'email' }],
      });
      var query = builder.buildExploreQuery('MEASUREMENTS');
      expect(query).toBe('SHOW MEASUREMENTS WHERE "app" = \'email\' LIMIT 100');
    });

    it('should have where tag name IN filter in tag values query for query with one tag', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '',
        tags: [{ key: 'app', value: 'asdsadsad' }],
      });
      var query = builder.buildExploreQuery('TAG_VALUES', 'app');
      expect(query).toBe('SHOW TAG VALUES WITH KEY = "app"');
    });

    it('should have measurement tag condition and tag name IN filter in tag values query', function() {
      var builder = new InfluxQueryBuilder({
        measurement: 'cpu',
        tags: [{ key: 'app', value: 'email' }, { key: 'host', value: 'server1' }],
      });
      var query = builder.buildExploreQuery('TAG_VALUES', 'app');
      expect(query).toBe('SHOW TAG VALUES FROM "cpu" WITH KEY = "app" WHERE "host" = \'server1\'');
    });

    it('should select from policy correctly if policy is specified', function() {
      var builder = new InfluxQueryBuilder({
        measurement: 'cpu',
        policy: 'one_week',
        tags: [{ key: 'app', value: 'email' }, { key: 'host', value: 'server1' }],
      });
      var query = builder.buildExploreQuery('TAG_VALUES', 'app');
      expect(query).toBe('SHOW TAG VALUES FROM "one_week"."cpu" WITH KEY = "app" WHERE "host" = \'server1\'');
    });

    it('should not include policy when policy is default', function() {
      var builder = new InfluxQueryBuilder({
        measurement: 'cpu',
        policy: 'default',
        tags: [],
      });
      var query = builder.buildExploreQuery('TAG_VALUES', 'app');
      expect(query).toBe('SHOW TAG VALUES FROM "cpu" WITH KEY = "app"');
    });

    it('should switch to regex operator in tag condition', function() {
      var builder = new InfluxQueryBuilder({
        measurement: 'cpu',
        tags: [{ key: 'host', value: '/server.*/' }],
      });
      var query = builder.buildExploreQuery('TAG_VALUES', 'app');
      expect(query).toBe('SHOW TAG VALUES FROM "cpu" WITH KEY = "app" WHERE "host" =~ /server.*/');
    });

    it('should build show field query', function() {
      var builder = new InfluxQueryBuilder({
        measurement: 'cpu',
        tags: [{ key: 'app', value: 'email' }],
      });
      var query = builder.buildExploreQuery('FIELDS');
      expect(query).toBe('SHOW FIELD KEYS FROM "cpu"');
    });

    it('should build show field query with regexp', function() {
      var builder = new InfluxQueryBuilder({
        measurement: '/$var/',
        tags: [{ key: 'app', value: 'email' }],
      });
      var query = builder.buildExploreQuery('FIELDS');
      expect(query).toBe('SHOW FIELD KEYS FROM /$var/');
    });

    it('should build show retention policies query', function() {
      var builder = new InfluxQueryBuilder({ measurement: 'cpu', tags: [] }, 'site');
      var query = builder.buildExploreQuery('RETENTION POLICIES');
      expect(query).toBe('SHOW RETENTION POLICIES on "site"');
    });
  });
});
