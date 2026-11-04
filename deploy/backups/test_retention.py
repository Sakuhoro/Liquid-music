import datetime, json, pathlib, tempfile, unittest
from retention import prune_snapshots

class RetentionTests(unittest.TestCase):
    def test_shared_objects_survive_and_old_unique_objects_are_removed(self):
        with tempfile.TemporaryDirectory() as folder:
            root = pathlib.Path(folder)
            (root/'snapshots').mkdir()
            (root/'objects').mkdir()
            old = '20261001T120000000000Z.json.age'
            current = '20261102T120000000000Z.json.age'
            for name in [old,current]: (root/'snapshots'/name).write_bytes(b'encrypted')
            shared = 'objects/'+'a'*64+'.age'
            stale = 'objects/'+'b'*64+'.age'
            for name in [shared,stale]: (root/name).write_bytes(b'encrypted')
            (root/'snapshot-index.json').write_text(json.dumps({old:[shared,stale]}))
            result = prune_snapshots(root,current,[shared],datetime.datetime(2026,11,2,12,tzinfo=datetime.timezone.utc))
            self.assertEqual(result['snapshotsRemoved'],1)
            self.assertTrue((root/shared).exists())
            self.assertFalse((root/stale).exists())
            self.assertEqual(list(json.loads((root/'snapshot-index.json').read_text())),[current])

    def test_refuses_to_delete_without_a_current_backup(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError):
                prune_snapshots(pathlib.Path(folder),'missing',[],datetime.datetime.now(datetime.timezone.utc))

    def test_legacy_snapshots_are_retained_conservatively(self):
        with tempfile.TemporaryDirectory() as folder:
            root=pathlib.Path(folder)
            (root/'snapshots').mkdir(); (root/'objects').mkdir()
            current='20261102T120000000000Z.json.age'
            legacy='20261101T120000000000Z.json.age'
            for name in [legacy,current]: (root/'snapshots'/name).write_bytes(b'encrypted')
            obj='objects/'+'c'*64+'.age';(root/obj).write_bytes(b'encrypted')
            result=prune_snapshots(root,current,[],datetime.datetime(2026,11,2,12,tzinfo=datetime.timezone.utc))
            self.assertEqual(result['snapshotsKept'],2)
            self.assertTrue((root/obj).exists())

if __name__=='__main__': unittest.main()
