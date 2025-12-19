import { useIntl } from 'react-intl';

import type { List, Map as ImmutableMap } from 'immutable';

import { useIdentity } from 'mastodon/identity_context';

import type { CustomEmoji } from '../models/custom_emoji';
import type { Status } from '../models/status';

import { EmojiHTML } from './emoji/html';
import { StatusBanner, BannerVariant } from './status_banner';
import TranslateButton from './translate_button';

export const ContentWarning: React.FC<{
  status: Status;
  expanded?: boolean;
  onClick?: () => void;
  onTranslate?: () => void;
  languages?: ImmutableMap<string, List<string>>;
}> = ({ status, expanded, onClick, onTranslate, languages }) => {
  const intl = useIntl();
  const identity = useIdentity();
  const hasSpoiler = !!status.get('spoiler_text');
  if (!hasSpoiler) {
    return null;
  }

  const text =
    (status.getIn(['translation', 'spoilerHtml']) as string | undefined) ??
    (status.get('spoilerHtml') as string);
  if (typeof text !== 'string' || text.length === 0) {
    return null;
  }

  const contentLocale = intl.locale.replace(/[_-].*/, '');
  const targetLanguages = languages?.get(
    (status.get('language') as string) || 'und',
  );
  const renderTranslate =
    !expanded &&
    onTranslate &&
    identity.signedIn &&
    ['public', 'unlisted'].includes(status.get('visibility') as string) &&
    (status.get('search_index') as string).trim().length > 0 &&
    targetLanguages?.includes(contentLocale);

  const translateButton = renderTranslate && (
    <TranslateButton
      onClick={onTranslate}
      translation={status.get('translation')}
    />
  );

  return (
    <StatusBanner
      expanded={expanded}
      onClick={onClick}
      variant={BannerVariant.Warning}
      action={translateButton}
    >
      <EmojiHTML
        as='span'
        htmlString={text}
        extraEmojis={status.get('emojis') as List<CustomEmoji>}
      />
    </StatusBanner>
  );
};
